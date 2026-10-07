/**
 * `dist/native/themes.ts`: objetos de tema para React Native (ADR-006, ADR-008).
 * Valores numéricos sin unidad, familias tipográficas nativas y sombras en la
 * forma `boxShadow` de la Nueva Arquitectura.
 */
import type { RenderInput } from './css.ts';
import { diffTokens, GENERATED_HEADER, orderedTokens } from './css.ts';
import type { NativeValue, ResolvedToken, TokenMap } from './model.ts';
import { cssVariableName, isIdentifier, objectKey } from './naming.ts';
import { buildTree, type TreeNode } from './tree.ts';
import { toNativeValue } from './values.ts';

function renderValue(value: NativeValue, indent: string): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  const inner = `${indent}  `;
  const layers = value.map((layer) => {
    const fields = Object.entries(layer).map(
      ([key, field]) =>
        `${key}: ${typeof field === 'string' ? JSON.stringify(field) : String(field)}`,
    );
    return `${inner}{ ${fields.join(', ')} }`;
  });
  return `[\n${layers.join(',\n')},\n${indent}]`;
}

function renderNode(node: TreeNode<NativeValue>, indent: string): string {
  if (node.kind === 'leaf') return renderValue(node.value, indent);
  const inner = `${indent}  `;
  const entries = [...node.children.entries()].map(
    ([key, child]) => `${inner}${objectKey(key)}: ${renderNode(child, inner)},`,
  );
  return `{\n${entries.join('\n')}\n${indent}}`;
}

function renderThemeObject(tokens: TokenMap): string {
  const ordered: TokenMap = new Map(orderedTokens(tokens).map((token) => [token.name, token]));
  return renderNode(buildTree(ordered, toNativeValue), '');
}

function renderList(items: readonly string[]): string {
  if (items.length === 0) return '[]';
  return `[\n${items.map((item) => `  ${JSON.stringify(item)},`).join('\n')}\n]`;
}

export function renderNative({ themeNames, defaultTheme, base, brands }: RenderInput): string {
  const baseDefault = base[defaultTheme];
  if (!baseDefault) throw new Error(`No hay tokens para el tema por defecto "${defaultTheme}".`);
  const tokenNames = orderedTokens(baseDefault).map((token) => token.name);
  const brandNames = Object.keys(brands);

  const lines: string[] = [
    `/* ${GENERATED_HEADER} */`,
    `import type { BrandName, CssVariableName, Theme, ThemeName, ThemeOverrides, TokenName } from '../types';`,
    '',
    `export const themeNames = ${renderList(themeNames)} as const satisfies readonly ThemeName[];`,
    '',
    `export const brandNames = ${renderList(brandNames)} as const satisfies readonly BrandName[];`,
    '',
    '/** Nombres de todos los tokens emitidos, en el orden de las salidas. */',
    `export const tokenNames = ${renderList(tokenNames)} as const satisfies readonly TokenName[];`,
    '',
    '/** Variable CSS que corresponde a cada token en `tokens.css`. */',
    'export const cssVariables = {',
    ...orderedTokens(baseDefault).map(
      (token) => `  ${JSON.stringify(token.name)}: ${JSON.stringify(cssVariableName(token.path))},`,
    ),
    '} as const satisfies Readonly<Record<TokenName, CssVariableName>>;',
    '',
  ];

  const themeExports: string[] = [];
  for (const theme of themeNames) {
    const tokens = base[theme];
    if (!tokens) continue;
    const object = renderThemeObject(tokens);
    if (isIdentifier(theme)) {
      lines.push(`export const ${theme}: Theme = ${object};`, '');
      themeExports.push(`  ${theme},`);
    } else {
      themeExports.push(`  ${JSON.stringify(theme)}: ${object},`);
    }
  }
  lines.push(
    'export const themes: Readonly<Record<ThemeName, Theme>> = {',
    ...themeExports,
    '};',
    '',
  );

  const brandEntries: string[] = [];
  for (const [brand, perTheme] of Object.entries(brands)) {
    const themeEntries = themeNames.map((theme) => {
      const overrides = diffTokens(
        base[theme] ?? new Map<string, ResolvedToken>(),
        perTheme[theme] ?? new Map<string, ResolvedToken>(),
      );
      const object =
        overrides.size === 0 ? '{}' : renderNode(buildTree(overrides, toNativeValue), '    ');
      return `    ${objectKey(theme)}: ${object},`;
    });
    brandEntries.push(`  ${objectKey(brand)}: {`, ...themeEntries, '  },');
  }
  lines.push(
    '/** Overrides de cada marca sobre cada tema; `UIProvider` los combina con el tema activo (ADR-010). */',
    'export const brands: Readonly<Record<BrandName, Readonly<Record<ThemeName, ThemeOverrides>>>> = {',
    ...brandEntries,
    '};',
    '',
  );
  return lines.join('\n');
}
