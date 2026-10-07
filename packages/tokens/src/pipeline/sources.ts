/**
 * Descubrimiento de los ficheros de tokens dentro de `src/`:
 *
 *   primitives/*.tokens.json         paleta y escalas (ADR-005)
 *   semantic/<tema>.tokens.json      capa semántica por tema
 *   brands/<marca>/*.tokens.json     overrides por marca; `<tema>.tokens.json` aplica solo a ese tema
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_THEME = 'light';
const TOKENS_SUFFIX = '.tokens.json';

export interface BrandFiles {
  /** Overrides comunes a todos los temas. */
  shared: string[];
  /** Overrides específicos de un tema, indexados por nombre de tema. */
  byTheme: Record<string, string[]>;
}

export interface TokenSources {
  primitives: string[];
  themes: Record<string, string>;
  brands: Record<string, BrandFiles>;
}

async function listTokenFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(TOKENS_SUFFIX))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

/** Tema por defecto primero y el resto en orden alfabético. */
export function themeOrder(themes: Record<string, string>): string[] {
  const names = Object.keys(themes);
  if (!names.includes(DEFAULT_THEME)) {
    throw new Error(`Falta el tema por defecto: semantic/${DEFAULT_THEME}${TOKENS_SUFFIX}`);
  }
  return [DEFAULT_THEME, ...names.filter((name) => name !== DEFAULT_THEME).sort()];
}

export async function discoverBrands(
  brandsDir: string,
  themeNames: readonly string[],
): Promise<Record<string, BrandFiles>> {
  const entries = await readdir(brandsDir, { withFileTypes: true }).catch(() => []);
  const brands: Record<string, BrandFiles> = {};
  for (const entry of entries
    .filter((item) => item.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const files = await listTokenFiles(path.join(brandsDir, entry.name));
    const brand: BrandFiles = { shared: [], byTheme: {} };
    for (const file of files) {
      const stem = path.basename(file, TOKENS_SUFFIX);
      if (themeNames.includes(stem)) {
        (brand.byTheme[stem] ??= []).push(file);
      } else {
        brand.shared.push(file);
      }
    }
    if (files.length > 0) brands[entry.name] = brand;
  }
  return brands;
}

export async function discoverSources(srcDir: string): Promise<TokenSources> {
  const primitives = await listTokenFiles(path.join(srcDir, 'primitives'));
  if (primitives.length === 0) {
    throw new Error(`No hay ficheros de primitivos en ${path.join(srcDir, 'primitives')}`);
  }
  const themes: Record<string, string> = {};
  for (const file of await listTokenFiles(path.join(srcDir, 'semantic'))) {
    themes[path.basename(file, TOKENS_SUFFIX)] = file;
  }
  const themeNames = themeOrder(themes);
  const brands = await discoverBrands(path.join(srcDir, 'brands'), themeNames);
  return { primitives, themes, brands };
}
