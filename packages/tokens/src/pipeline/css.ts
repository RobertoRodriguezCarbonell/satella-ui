/**
 * `dist/web/tokens.css`: variables CSS por tema y marca (ADR-006, ADR-007).
 *
 *   :root, [data-theme="light"]      todos los tokens del tema por defecto
 *   [data-theme="dark"]              solo lo que cambia respecto al tema por defecto
 *   [data-brand="x"]                 solo lo que la marca cambia en el tema por defecto
 *   [data-theme="dark"][data-brand="x"]  lo que aún falte para que la cascada dé el valor correcto
 */
import { categoryRank, cssVariableName } from './naming.ts';
import type { ResolvedToken, TokenMap } from './model.ts';
import { toCssValue } from './values.ts';

export interface RenderInput {
  themeNames: readonly string[];
  defaultTheme: string;
  base: Record<string, TokenMap>;
  brands: Record<string, Record<string, TokenMap>>;
}

export const GENERATED_HEADER = 'Generado por @satellatickets/tokens. No editar a mano (ADR-006).';

export function sameValue(a: ResolvedToken, b: ResolvedToken): boolean {
  return a.type === b.type && JSON.stringify(a.value) === JSON.stringify(b.value);
}

/** Tokens de `to` cuyo valor difiere del que tienen en `from` (o que no existen en `from`). */
export function diffTokens(from: TokenMap, to: TokenMap): TokenMap {
  const diff: TokenMap = new Map<string, ResolvedToken>();
  for (const [name, token] of to) {
    const previous = from.get(name);
    if (!previous || !sameValue(previous, token)) diff.set(name, token);
  }
  return diff;
}

export function orderedTokens(tokens: TokenMap): ResolvedToken[] {
  return [...tokens.values()]
    .map((token, index) => ({ token, index }))
    .sort((a, b) => categoryRank(a.token.path) - categoryRank(b.token.path) || a.index - b.index)
    .map(({ token }) => token);
}

function colorScheme(theme: string): string {
  return theme === 'dark' ? 'dark' : 'light';
}

function block(selector: string, declarations: readonly string[]): string {
  return `${selector} {\n${declarations.map((line) => `  ${line}`).join('\n')}\n}\n`;
}

function declarations(tokens: TokenMap): string[] {
  return orderedTokens(tokens).map(
    (token) => `${cssVariableName(token.path)}: ${toCssValue(token)};`,
  );
}

/**
 * Valor que la cascada ya aporta para cada token en un contexto tema + marca,
 * antes del bloque combinado: marca (tema por defecto) > tema > base.
 */
function effectiveWithoutCombined(
  name: string,
  brandDefault: TokenMap,
  themeDiff: TokenMap,
  base: TokenMap,
): ResolvedToken | undefined {
  return brandDefault.get(name) ?? themeDiff.get(name) ?? base.get(name);
}

export function renderCss({ themeNames, defaultTheme, base, brands }: RenderInput): string {
  const baseDefault = base[defaultTheme];
  if (!baseDefault) throw new Error(`No hay tokens para el tema por defecto "${defaultTheme}".`);
  const otherThemes = themeNames.filter((theme) => theme !== defaultTheme);
  const themeDiffs = new Map(
    otherThemes.map((theme) => [
      theme,
      diffTokens(baseDefault, base[theme] ?? new Map<string, ResolvedToken>()),
    ]),
  );

  const blocks: string[] = [`/* ${GENERATED_HEADER} */\n`];
  blocks.push(
    block(`:root,\n[data-theme="${defaultTheme}"]`, [
      `color-scheme: ${colorScheme(defaultTheme)};`,
      ...declarations(baseDefault),
    ]),
  );
  for (const theme of otherThemes) {
    blocks.push(
      block(`[data-theme="${theme}"]`, [
        `color-scheme: ${colorScheme(theme)};`,
        ...declarations(themeDiffs.get(theme) ?? new Map<string, ResolvedToken>()),
      ]),
    );
  }
  for (const [brand, perTheme] of Object.entries(brands)) {
    const brandDefault = diffTokens(baseDefault, perTheme[defaultTheme] ?? baseDefault);
    if (brandDefault.size > 0) {
      blocks.push(block(`[data-brand="${brand}"]`, declarations(brandDefault)));
    }
    for (const theme of otherThemes) {
      const target = perTheme[theme] ?? base[theme] ?? new Map<string, ResolvedToken>();
      const themeDiff = themeDiffs.get(theme) ?? new Map<string, ResolvedToken>();
      const combined: TokenMap = new Map<string, ResolvedToken>();
      for (const [name, token] of target) {
        const effective = effectiveWithoutCombined(name, brandDefault, themeDiff, baseDefault);
        if (!effective || !sameValue(effective, token)) combined.set(name, token);
      }
      if (combined.size > 0) {
        blocks.push(
          block(`[data-theme="${theme}"][data-brand="${brand}"]`, declarations(combined)),
        );
      }
    }
  }
  return blocks.join('\n');
}
