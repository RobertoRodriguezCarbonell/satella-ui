import { defineConfig } from 'tsdown';

// build.ts genera antes dist/web/tokens.css, dist/native/themes.ts y dist/types.ts
// (ADR-006); tsdown no debe vaciar dist/ al compilar src/index.ts.
export default defineConfig({
  name: 'tokens',
  entry: { index: 'src/index.ts' },
  format: 'esm',
  platform: 'neutral',
  dts: true,
  clean: false,
});
