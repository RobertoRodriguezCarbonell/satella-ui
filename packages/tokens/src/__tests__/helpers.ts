import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type ResolvedSources, resolveSources } from '../pipeline/index.ts';
import {
  discoverBrands,
  discoverSources,
  themeOrder,
  type TokenSources,
} from '../pipeline/sources.ts';

export const PACKAGE_DIR = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');
export const SRC_DIR = path.join(PACKAGE_DIR, 'src');
export const FIXTURES_DIR = path.join(PACKAGE_DIR, 'src/__tests__/fixtures');
export const SCHEMA_PATH = path.join(PACKAGE_DIR, 'schemas/dtcg/2025.10/format.json');
export const CONTRAST_PAIRS_PATH = path.join(SRC_DIR, 'contrast-pairs.json');

/** Fuentes reales del paquete más la marca de ejemplo que vive en los fixtures. */
export async function loadSources(): Promise<TokenSources> {
  const sources = await discoverSources(SRC_DIR);
  const fixtureBrands = await discoverBrands(
    path.join(FIXTURES_DIR, 'brands'),
    themeOrder(sources.themes),
  );
  return { ...sources, brands: { ...sources.brands, ...fixtureBrands } };
}

let cached: Promise<ResolvedSources> | undefined;

export function loadResolved(): Promise<ResolvedSources> {
  cached ??= loadSources().then(resolveSources);
  return cached;
}

export function allTokenFiles(sources: TokenSources): string[] {
  return [
    ...sources.primitives,
    ...Object.values(sources.themes),
    ...Object.values(sources.brands).flatMap((brand) => [
      ...brand.shared,
      ...Object.values(brand.byTheme).flat(),
    ]),
  ];
}
