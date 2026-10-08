import { defineConfig } from 'tsdown';

// Paquete de datos sin React: una sola salida (ADR-028).
export default defineConfig({
  name: 'icons',
  entry: { index: 'src/index.ts' },
  format: 'esm',
  platform: 'neutral',
  dts: true,
});
