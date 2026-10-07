import { defineConfig } from 'tsdown';

export default defineConfig({
  name: 'core',
  entry: { index: 'src/index.ts' },
  format: 'esm',
  platform: 'neutral',
  dts: true,
  deps: {
    // `react` es peer y nunca se empaqueta (ADR-019).
    neverBundle: ['react'],
  },
});
