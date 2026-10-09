/**
 * Comprueba los paquetes tal y como llegarían a npm (ADR-019, ADR-022).
 *
 *   1. `pnpm pack` de tokens, core y ui: el mismo .tgz que se publicaría.
 *   2. Cada .tgz incluye su licencia y su README, y publint lo da por bueno.
 *   3. Prueba de consumo: copia tests/consumer-web fuera del monorepo, le instala los
 *      .tgz con npm y comprueba tipos, build, render en servidor y la resolución de
 *      la condición `react-native`.
 *   4. Lo mismo con tests/consumer-next: una app Next.js que usa los paquetes desde un
 *      Server Component (ADR-041).
 *   5. Y con tests/consumer-native: una app Expo que Metro empaqueta para iOS.
 *
 * Necesita `pnpm build` antes. Con KEEP=1 conserva el directorio de trabajo.
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES = ['tokens', 'core', 'ui'];
const work = mkdtempSync(path.join(os.tmpdir(), 'satella-ui-packages-'));

function run(command, args, cwd = root) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function step(title) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 70 - title.length))}`);
}

try {
  step('Empaquetar');
  const tarballs = {};
  for (const name of PACKAGES) {
    const dir = path.join(root, 'packages', name);
    assert(
      existsSync(path.join(dir, 'dist')),
      `Falta packages/${name}/dist: ejecuta antes pnpm build.`,
    );
    run('pnpm', ['pack', '--pack-destination', work], dir);
    const file = readdirSync(work).find((entry) => entry.startsWith(`satellatickets-${name}-`));
    assert(file, `No se ha generado el .tgz de ${name}.`);
    tarballs[name] = path.join(work, file);
  }

  step('Contenido');
  for (const name of PACKAGES) {
    const files = execFileSync('tar', ['-tzf', tarballs[name]], { encoding: 'utf8' }).split('\n');
    for (const required of ['package/LICENSE', 'package/README.md']) {
      assert(files.includes(required), `El .tgz de ${name} no incluye ${required}.`);
    }
  }
  assert(
    execFileSync('tar', ['-tzf', tarballs.ui], { encoding: 'utf8' }).includes('package/NOTICE.md'),
    'El .tgz de ui no incluye NOTICE.md, el aviso de licencia de los iconos de Lucide.',
  );
  console.log('Cada paquete incluye su licencia y su README.');

  step('publint');
  for (const name of PACKAGES) run('pnpm', ['exec', 'publint', tarballs[name], '--strict']);

  /** Copia una app de tests/ fuera del monorepo y le instala los .tgz con npm. */
  function installFixture(name, directDependencies) {
    const app = path.join(work, name);
    cpSync(path.join(root, 'tests', name), app, { recursive: true });
    const manifest = JSON.parse(readFileSync(path.join(app, 'package.json'), 'utf8'));
    for (const dependency of directDependencies) {
      manifest.dependencies[`@satellatickets/${dependency}`] = `file:${tarballs[dependency]}`;
    }
    // `ui` depende de versiones de core y tokens que aún no están en el registro.
    manifest.overrides = {
      '@satellatickets/core': `file:${tarballs.core}`,
      '@satellatickets/tokens': `file:${tarballs.tokens}`,
    };
    writeFileSync(path.join(app, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    run('npm', ['install', '--no-audit', '--no-fund'], app);
    return app;
  }

  step('App consumidora');
  const app = installFixture('consumer-web', ['ui']);

  // Tipos: sin `skipLibCheck`, así que los .d.ts publicados no pueden depender de
  // paquetes que una app web no tiene (react-native).
  run('npx', ['tsc', '--noEmit'], app);

  run('npx', ['vite', 'build'], app);
  const assets = path.join(app, 'dist', 'assets');
  const css = readdirSync(assets)
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(path.join(assets, file), 'utf8'))
    .join('\n');
  assert(css.includes('--color-action-primary'), 'styles.css no incluye los tokens.');
  assert(/\.sui-primary/.test(css), 'styles.css no incluye las clases de los componentes.');

  run('node', ['ssr.mjs'], app);

  // La condición `react-native` debe resolver las vistas nativas, sin nada de web.
  const nativeBundle = path.join(app, 'dist-native', 'index.js');
  run(
    'npx',
    [
      'esbuild',
      'src/native.ts',
      '--bundle',
      '--format=esm',
      '--conditions=react-native',
      '--external:react',
      '--external:react/jsx-runtime',
      '--external:react-native',
      '--external:react-native-svg',
      `--outfile=${nativeBundle}`,
    ],
    app,
  );
  const native = readFileSync(nativeBundle, 'utf8');
  assert(native.includes('Pressable'), 'El bundle nativo no usa la vista nativa de Button.');
  assert(!/react-dom|\.css["']/.test(native), 'El bundle nativo arrastra dependencias de web.');

  step('Frontera entre servidor y cliente');
  // ADR-041: el build web de `ui` y el fichero de contextos y hooks de `core` llevan
  // "use client"; el resto de `core` es código puro y no importa React.
  const installed = (file) =>
    readFileSync(path.join(app, 'node_modules', '@satellatickets', file), 'utf8');
  const isClient = (code) => /^\s*['"]use client['"];/.test(code);
  assert(isClient(installed('ui/dist/web/index.js')), 'El build web de ui no lleva "use client".');
  assert(
    !isClient(installed('ui/dist/native/index.js')),
    'El build nativo de ui lleva "use client" y no lo necesita.',
  );
  assert(isClient(installed('core/dist/client.js')), 'core/dist/client.js no lleva "use client".');
  const coreIndex = installed('core/dist/index.js');
  assert(
    !isClient(coreIndex),
    'core/dist/index.js lleva "use client": dejaría de ser código puro.',
  );
  assert(
    !/from\s*['"]react['"]/.test(coreIndex),
    'core/dist/index.js importa react: no se podría evaluar en un Server Component.',
  );
  assert(
    /from\s*['"]\.\/client\.js['"]/.test(coreIndex),
    'core/dist/index.js no reexporta ./client.js como un fichero aparte.',
  );
  console.log('Las directivas "use client" están donde toca.');

  step('App consumidora Next.js');
  const next = installFixture('consumer-next', ['ui', 'core']);
  // `next build` falla si un Server Component evalúa código que solo existe en el cliente.
  run('npx', ['next', 'build'], next);
  const html = readFileSync(path.join(next, '.next', 'server', 'app', 'index.html'), 'utf8');
  assert(html.includes('Comprar entradas'), 'La página de Next.js no se ha prerrenderizado.');
  assert(
    /class="[^"]*sui-root/.test(html),
    'El HTML de Next.js no lleva las clases de los componentes.',
  );
  assert(
    html.includes('primary, secondary, ghost, danger'),
    'El Server Component no ha podido leer las constantes de core.',
  );
  assert(html.includes('data-theme="dark"'), 'UIProvider no ha puesto el tema en el HTML.');
  console.log('Next.js prerrenderiza la página con los componentes y las constantes de core.');

  step('App consumidora Expo');
  const expoApp = installFixture('consumer-native', ['ui']);
  // Los tipos nativos publicados, con la configuración de TypeScript de Expo.
  run('npx', ['tsc', '--noEmit'], expoApp);
  // Metro, el empaquetador real de una app nativa: resuelve la condición `react-native`
  // de los `exports` y compila las vistas `.native` ya empaquetadas. Sin minificar ni
  // pasar a bytecode, para poder leer el resultado.
  run(
    'npx',
    ['expo', 'export', '--platform', 'ios', '--output-dir', 'dist', '--no-minify', '--no-bytecode'],
    expoApp,
  );
  const bundles = path.join(expoApp, 'dist', '_expo', 'static', 'js', 'ios');
  const metroBundle = readdirSync(bundles)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(path.join(bundles, file), 'utf8'))
    .join('\n');
  assert(metroBundle.includes('Comprar'), 'El bundle de Metro no incluye la pantalla de la app.');
  assert(
    metroBundle.includes('accessibilityRole'),
    'El bundle de Metro no usa las vistas nativas de los componentes.',
  );
  assert(
    // `sui-` es el prefijo de las clases CSS de la librería: solo existe en las vistas web.
    !metroBundle.includes('sui-root'),
    'El bundle de Metro arrastra las vistas web de los componentes.',
  );
  console.log('Metro empaqueta la app con las vistas nativas.');

  console.log(
    '\nPaquetes correctos: publint, tipos, build, render en servidor, Next.js y Expo con Metro.',
  );
} finally {
  if (process.env.KEEP) console.log(`\nDirectorio de trabajo: ${work}`);
  else rmSync(work, { recursive: true, force: true });
}
