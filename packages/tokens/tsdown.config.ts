import { defineConfig } from 'tsdown';

// Fase 1 añadirá build.ts (Style Dictionary) que genera dist/web/tokens.css,
// dist/native/themes.ts y dist/types.ts antes de este paso (ADR-006).
export default defineConfig({
  name: 'tokens',
  entry: { index: 'src/index.ts' },
  format: 'esm',
  platform: 'neutral',
  dts: true,
});
