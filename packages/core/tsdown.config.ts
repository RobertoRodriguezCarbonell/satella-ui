import { defineConfig } from 'tsdown';

/**
 * `index.ts` reexporta `./client`. Sin esto, el empaquetador metería ese código en un
 * fichero compartido sin directiva y `index.js` lo importaría de ahí. Al dejar la
 * importación como externa, `index.js` conserva un `export * from './client.js'` y la
 * frontera entre servidor y cliente coincide con un fichero (ADR-041).
 */
const clientBoundary = {
  name: 'core:client-boundary',
  resolveId(source: string, importer: string | undefined) {
    if (source !== './client' || importer === undefined) return null;
    return /[\\/]src[\\/]index\.ts$/.test(importer) ? { id: './client.js', external: true } : null;
  },
};

export default defineConfig({
  name: 'core',
  // Dos ficheros de salida (ADR-041): `index.js` es código puro y `client.js` reúne los
  // contextos y los hooks. `index.js` reexporta `client.js`, así que la API es una sola.
  entry: { index: 'src/index.ts', client: 'src/client.ts' },
  format: 'esm',
  platform: 'neutral',
  dts: true,
  deps: {
    // `react` es peer y nunca se empaqueta (ADR-019).
    neverBundle: ['react'],
  },
  plugins: [clientBoundary],
  // Solo `client.js` lleva la directiva: Next.js lo trata como Client Component y no
  // lo evalúa al renderizar un Server Component.
  banner: ({ fileName }) => (fileName === 'client.js' ? { js: "'use client';" } : undefined),
});
