import { defineConfig, type UserConfig } from 'tsdown';

// Doble build (ADR-019): el mismo código se compila dos veces, una resolviendo
// `.web.tsx` y otra `.native.tsx`, en dist/web y dist/native. En web, los CSS
// Modules se compilan a un único dist/web/styles.css (ADR-007).
const platforms = ['web', 'native'] as const;
type Platform = (typeof platforms)[number];

function platformConfig(platform: Platform): UserConfig {
  return {
    name: `ui:${platform}`,
    entry: { index: 'src/index.ts' },
    outDir: `dist/${platform}`,
    format: 'esm',
    platform: 'neutral',
    dts: true,
    tsconfig: `tsconfig.${platform}.json`,
    deps: {
      // Peers, nunca se empaquetan (ADR-019).
      neverBundle: ['react', 'react-dom', 'react-native', 'react-native-svg'],
      // `icons` es interno y viaja dentro de `ui` (ADR-020).
      alwaysBundle: ['@satellatickets/icons'],
    },
    ...(platform === 'web'
      ? {
          // Todos los componentes usan hooks, contexto o eventos: el build web entero es un
          // Client Component (ADR-041). Sin la directiva, importarlo desde un Server
          // Component de Next.js falla al evaluar el módulo.
          banner: { js: "'use client';" },
          css: {
            fileName: 'styles.css',
            splitting: false,
            modules: { generateScopedName: 'sui-[local]-[hash]' },
          },
        }
      : {}),
    inputOptions(options) {
      options.resolve = {
        ...options.resolve,
        extensions: [`.${platform}.tsx`, `.${platform}.ts`, '.tsx', '.ts', '.mjs', '.js', '.json'],
      };
      return options;
    },
  };
}

export default defineConfig(platforms.map(platformConfig));
