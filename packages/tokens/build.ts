/**
 * Build de @satellatickets/tokens (ADR-006). Se ejecuta con Node directamente
 * (type stripping, Node ≥ 22.18):
 *
 *   node build.ts                       genera dist/web/tokens.css, dist/native/themes.ts y dist/types.ts
 *   node --watch-path=src build.ts      vuelve a generar al cambiar cualquier fichero de src/
 *
 * Después, `tsdown` compila src/index.ts (que reexporta los ficheros generados) a dist/index.js.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTokens } from './src/pipeline/index.ts';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const summary = await buildTokens({
  srcDir: path.join(packageDir, 'src'),
  outDir: path.join(packageDir, 'dist'),
});

const brands = summary.brandNames.length > 0 ? summary.brandNames.join(', ') : 'ninguna';
console.log(
  `[tokens] ${summary.tokenCount} tokens · temas: ${summary.themeNames.join(', ')} · marcas: ${brands}`,
);
for (const file of summary.files) {
  console.log(`[tokens]   ${path.relative(packageDir, file)}`);
}
