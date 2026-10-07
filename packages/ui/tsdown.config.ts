import { defineConfig, type UserConfig } from 'tsdown';

// Doble build (ADR-019): el mismo código se compila dos veces, una resolviendo
// `.web.tsx` y otra `.native.tsx`, en dist/web y dist/native. La Fase 2 añade
// los CSS Modules compilados a un único styles.css (ADR-007).
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
      neverBundle: ['react', 'react-dom', 'react-native'],
      // `icons` es interno y viaja dentro de `ui` (ADR-020).
      alwaysBundle: ['@satellatickets/icons'],
    },
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
