/**
 * Contraste WCAG AA (ADR-015): cada pareja declarada en `contrast-pairs.json`
 * cumple el ratio exigido en todos los temas y en todas las marcas.
 */
import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { contrastRatio, parseColor } from '../pipeline/color.ts';
import type { DtcgColorValue, TokenMap } from '../pipeline/model.ts';
import { CONTRAST_PAIRS_PATH, loadResolved } from './helpers.ts';

interface Pair {
  foreground: string;
  background: string;
  level?: 'text' | 'largeText' | 'ui';
}

interface PairsFile {
  levels: Record<'text' | 'largeText' | 'ui', number>;
  pairs: Pair[];
}

const pairsFile = JSON.parse(await readFile(CONTRAST_PAIRS_PATH, 'utf8')) as PairsFile;
const resolved = await loadResolved();

const contexts: { label: string; tokens: TokenMap }[] = [
  ...resolved.themeNames.flatMap((theme) => {
    const tokens = resolved.base[theme];
    return tokens ? [{ label: `tema ${theme}`, tokens }] : [];
  }),
  ...Object.entries(resolved.brands).flatMap(([brand, perTheme]) =>
    resolved.themeNames.flatMap((theme) => {
      const tokens = perTheme[theme];
      return tokens ? [{ label: `marca ${brand}, tema ${theme}`, tokens }] : [];
    }),
  ),
];

function colorOf(tokens: TokenMap, name: string) {
  const token = tokens.get(name);
  if (!token) throw new Error(`La pareja de contraste referencia un token inexistente: ${name}`);
  if (token.type !== 'color') throw new Error(`${name} no es un color.`);
  return parseColor(token.value as DtcgColorValue, name);
}

describe('contraste WCAG AA', () => {
  it('declara parejas y niveles', () => {
    expect(pairsFile.pairs.length).toBeGreaterThan(0);
    expect(pairsFile.levels).toEqual({ text: 4.5, largeText: 3, ui: 3 });
  });

  describe.each(contexts)('$label', ({ tokens }) => {
    it.each(pairsFile.pairs)(
      '$foreground sobre $background',
      ({ foreground, background, level = 'text' }) => {
        const ratio = contrastRatio(colorOf(tokens, foreground), colorOf(tokens, background));
        expect(
          ratio,
          `${foreground} sobre ${background}: ${ratio.toFixed(2)}:1 < ${pairsFile.levels[level]}:1`,
        ).toBeGreaterThanOrEqual(pairsFile.levels[level]);
      },
    );
  });
});
