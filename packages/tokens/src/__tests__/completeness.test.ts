/**
 * Completitud (ADR-015): cada tema y cada marca define exactamente los mismos
 * tokens semánticos, y ninguna salida contiene la paleta en bruto.
 */
import { describe, expect, it } from 'vitest';

import { completenessProblems } from '../pipeline/index.ts';
import { isEmitted, PRIVATE_ROOT, SUPPORTED_TYPES } from '../pipeline/model.ts';
import { loadResolved } from './helpers.ts';

describe('completitud de temas y marcas', () => {
  it('el tema por defecto es light y existe dark', async () => {
    const { themeNames, defaultTheme } = await loadResolved();
    expect(defaultTheme).toBe('light');
    expect(themeNames).toEqual(['light', 'dark']);
  });

  it('todos los temas definen los mismos tokens con el mismo tipo', async () => {
    const { base, defaultTheme, themeNames } = await loadResolved();
    const reference = base[defaultTheme];
    expect(reference?.size ?? 0).toBeGreaterThan(0);
    for (const theme of themeNames) {
      const candidate = base[theme];
      expect(candidate, theme).toBeDefined();
      if (!reference || !candidate) continue;
      expect(
        completenessProblems(reference, candidate, { reference: defaultTheme, candidate: theme }),
      ).toEqual([]);
    }
  });

  it('cada marca cubre todos los tokens de cada tema sin añadir ninguno', async () => {
    const { base, brands, themeNames } = await loadResolved();
    expect(Object.keys(brands)).toContain('demo');
    for (const [brand, perTheme] of Object.entries(brands)) {
      for (const theme of themeNames) {
        const reference = base[theme];
        const candidate = perTheme[theme];
        expect(candidate, `${brand}/${theme}`).toBeDefined();
        if (!reference || !candidate) continue;
        expect(
          completenessProblems(reference, candidate, {
            reference: theme,
            candidate: `${brand}/${theme}`,
          }),
        ).toEqual([]);
      }
    }
  });

  it('la paleta no se emite y solo hay tipos soportados', async () => {
    const { base } = await loadResolved();
    for (const tokens of Object.values(base)) {
      for (const token of tokens.values()) {
        expect(token.path[0]).not.toBe(PRIVATE_ROOT);
        expect(isEmitted(token)).toBe(true);
        expect(SUPPORTED_TYPES).toContain(token.type);
      }
    }
  });

  it('los tokens semánticos de color tienen descripción en el tema por defecto', async () => {
    const { base, defaultTheme } = await loadResolved();
    const missing = [...(base[defaultTheme]?.values() ?? [])]
      .filter((token) => token.path[0] === 'color' && !token.description)
      .map((token) => token.name);
    expect(missing).toEqual([]);
  });
});
