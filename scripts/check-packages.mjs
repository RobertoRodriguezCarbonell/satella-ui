/**
 * Comprueba los paquetes tal y como llegarían a npm (ADR-019, ADR-022).
 *
 *   1. `pnpm pack` de tokens, core y ui: el mismo .tgz que se publicaría.
 *   2. publint sobre cada .tgz.
 *   3. Prueba de consumo: copia tests/consumer-web fuera del monorepo, le instala los
 *      .tgz con npm y comprueba tipos, build, render en servidor y la resolución de
 *      la condición `react-native`.
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

  step('publint');
  for (const name of PACKAGES) run('pnpm', ['exec', 'publint', tarballs[name], '--strict']);

  step('App consumidora');
  const app = path.join(work, 'app');
  cpSync(path.join(root, 'tests', 'consumer-web'), app, { recursive: true });
  const manifest = JSON.parse(readFileSync(path.join(app, 'package.json'), 'utf8'));
  manifest.dependencies['@satellatickets/ui'] = `file:${tarballs.ui}`;
  // `ui` depende de versiones de core y tokens que aún no están en el registro.
  manifest.overrides = {
    '@satellatickets/core': `file:${tarballs.core}`,
    '@satellatickets/tokens': `file:${tarballs.tokens}`,
  };
  writeFileSync(path.join(app, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  run('npm', ['install', '--no-audit', '--no-fund'], app);

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

  console.log(
    '\nPaquetes correctos: publint, tipos, build, render en servidor y resolución nativa.',
  );
} finally {
  if (process.env.KEEP) console.log(`\nDirectorio de trabajo: ${work}`);
  else rmSync(work, { recursive: true, force: true });
}
