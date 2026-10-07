/**
 * Orquestación del build de tokens (ADR-006): descubre las fuentes, resuelve
 * cada tema y cada marca con Style Dictionary, valida la completitud y genera
 * las tres salidas de `dist/`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { diffTokens, renderCss, type RenderInput } from './css.ts';
import { isEmitted, type TokenMap } from './model.ts';
import { renderNative } from './native.ts';
import { renderTypes } from './render-types.ts';
import { resolveTokenSet } from './resolve.ts';
import { DEFAULT_THEME, discoverSources, themeOrder, type TokenSources } from './sources.ts';

export type { TokenSources } from './sources.ts';
export { diffTokens };

export interface ResolvedSources extends RenderInput {
  themeNames: string[];
}

export class TokenSetError extends Error {
  constructor(message: string, problems: readonly string[]) {
    super(`${message}\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
    this.name = 'TokenSetError';
  }
}

function emittedOnly(tokens: TokenMap): TokenMap {
  return new Map([...tokens].filter(([, token]) => isEmitted(token)));
}

/** Diferencias de nombres y tipos entre dos conjuntos; vacío si son equivalentes. */
export function completenessProblems(
  reference: TokenMap,
  candidate: TokenMap,
  labels: { reference: string; candidate: string },
): string[] {
  const problems: string[] = [];
  for (const [name, token] of reference) {
    const other = candidate.get(name);
    if (!other)
      problems.push(`${name} existe en ${labels.reference} pero no en ${labels.candidate}`);
    else if (other.type !== token.type) {
      problems.push(
        `${name} es "${token.type}" en ${labels.reference} y "${other.type}" en ${labels.candidate}`,
      );
    }
  }
  for (const name of candidate.keys()) {
    if (!reference.has(name))
      problems.push(`${name} existe en ${labels.candidate} pero no en ${labels.reference}`);
  }
  return problems;
}

export async function resolveSources(sources: TokenSources): Promise<ResolvedSources> {
  const themeNames = themeOrder(sources.themes);
  const base: Record<string, TokenMap> = {};
  for (const theme of themeNames) {
    const file = sources.themes[theme];
    if (!file) continue;
    base[theme] = emittedOnly(await resolveTokenSet({ source: [...sources.primitives, file] }));
  }
  const reference = base[DEFAULT_THEME];
  if (!reference) throw new Error(`No se pudo resolver el tema por defecto "${DEFAULT_THEME}".`);
  for (const theme of themeNames) {
    const candidate = base[theme];
    if (!candidate || theme === DEFAULT_THEME) continue;
    const problems = completenessProblems(reference, candidate, {
      reference: `el tema ${DEFAULT_THEME}`,
      candidate: `el tema ${theme}`,
    });
    if (problems.length > 0) {
      throw new TokenSetError(
        `El tema "${theme}" no define los mismos tokens que "${DEFAULT_THEME}":`,
        problems,
      );
    }
  }

  const brands: Record<string, Record<string, TokenMap>> = {};
  for (const [brand, files] of Object.entries(sources.brands)) {
    brands[brand] = {};
    for (const theme of themeNames) {
      const themeFile = sources.themes[theme];
      const baseTheme = base[theme];
      if (!themeFile || !baseTheme) continue;
      // Los overrides específicos del tema sobrescriben a los comunes sin aviso de colisión
      // si estos van en `include` (Style Dictionary solo avisa entre ficheros `source`).
      const themeSpecific = files.byTheme[theme] ?? [];
      const include =
        themeSpecific.length > 0
          ? [...sources.primitives, themeFile, ...files.shared]
          : [...sources.primitives, themeFile];
      const source = themeSpecific.length > 0 ? themeSpecific : files.shared;
      if (source.length === 0) {
        brands[brand][theme] = baseTheme;
        continue;
      }
      const full = emittedOnly(await resolveTokenSet({ include, source }));
      const problems = completenessProblems(baseTheme, full, {
        reference: `el tema ${theme}`,
        candidate: `la marca ${brand} (${theme})`,
      });
      if (problems.length > 0) {
        throw new TokenSetError(
          `La marca "${brand}" solo puede sobrescribir tokens existentes (tema ${theme}):`,
          problems,
        );
      }
      brands[brand][theme] = full;
    }
  }
  return { themeNames, defaultTheme: DEFAULT_THEME, base, brands };
}

export const OUTPUT_FILES = {
  css: 'web/tokens.css',
  native: 'native/themes.ts',
  types: 'types.ts',
} as const;

export interface GeneratedOutputs {
  css: string;
  native: string;
  types: string;
}

export function renderAll(resolved: ResolvedSources): GeneratedOutputs {
  return {
    css: renderCss(resolved),
    native: renderNative(resolved),
    types: renderTypes(resolved),
  };
}

export interface BuildSummary {
  tokenCount: number;
  themeNames: string[];
  brandNames: string[];
  files: string[];
}

export async function writeOutputs(outDir: string, outputs: GeneratedOutputs): Promise<string[]> {
  const files: string[] = [];
  for (const [key, relative] of Object.entries(OUTPUT_FILES) as [
    keyof GeneratedOutputs,
    string,
  ][]) {
    const target = path.join(outDir, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, outputs[key], 'utf8');
    files.push(target);
  }
  return files;
}

export async function buildTokens(options: {
  srcDir: string;
  outDir: string;
}): Promise<BuildSummary> {
  const sources = await discoverSources(options.srcDir);
  const resolved = await resolveSources(sources);
  const files = await writeOutputs(options.outDir, renderAll(resolved));
  return {
    tokenCount: resolved.base[resolved.defaultTheme]?.size ?? 0,
    themeNames: resolved.themeNames,
    brandNames: Object.keys(resolved.brands),
    files,
  };
}
