/**
 * `dist/types.ts`: tipos con los nombres de todos los tokens emitidos (ADR-006,
 * ADR-014). Un token inexistente es un error de compilación.
 */
import { GENERATED_HEADER, orderedTokens, type RenderInput } from './css.ts';
import type { TokenMap } from './model.ts';
import { cssVariableName, objectKey } from './naming.ts';
import { buildTree, type TreeNode } from './tree.ts';
import { nativeTypeName } from './values.ts';

function renderUnion(name: string, members: readonly string[], doc?: string): string {
  const lines = doc ? [`/** ${doc} */`] : [];
  if (members.length === 0) {
    lines.push(`export type ${name} = never;`);
  } else {
    lines.push(
      `export type ${name} =`,
      ...members.map((member) => `  | ${JSON.stringify(member)}`),
    );
    lines[lines.length - 1] += ';';
  }
  return lines.join('\n');
}

function renderNode(node: TreeNode<string>, indent: string): string {
  if (node.kind === 'leaf') return node.value;
  const inner = `${indent}  `;
  const entries = [...node.children.entries()].flatMap(([key, child]) => {
    const doc =
      child.kind === 'leaf' && child.token.description
        ? [`${inner}/** ${child.token.description} */`]
        : [];
    return [...doc, `${inner}${objectKey(key)}: ${renderNode(child, inner)};`];
  });
  return `{\n${entries.join('\n')}\n${indent}}`;
}

function renderThemeInterface(tokens: TokenMap): string {
  const ordered: TokenMap = new Map(orderedTokens(tokens).map((token) => [token.name, token]));
  const tree = buildTree(ordered, (token) => nativeTypeName(token.type));
  return `export interface Theme ${renderNode(tree, '')}`;
}

export function renderTypes({ themeNames, defaultTheme, base, brands }: RenderInput): string {
  const baseDefault = base[defaultTheme];
  if (!baseDefault) throw new Error(`No hay tokens para el tema por defecto "${defaultTheme}".`);
  const tokens = orderedTokens(baseDefault);
  return [
    `/* ${GENERATED_HEADER} */`,
    '',
    renderUnion('ThemeName', themeNames),
    '',
    renderUnion('BrandName', Object.keys(brands)),
    '',
    renderUnion(
      'TokenName',
      tokens.map((token) => token.name),
      'Nombre de cada token emitido, con la ruta separada por puntos.',
    ),
    '',
    renderUnion(
      'CssVariableName',
      tokens.map((token) => cssVariableName(token.path)),
      'Variable CSS de cada token en `tokens.css`.',
    ),
    '',
    "export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';",
    '',
    '/** Curva de Bézier cúbica, `[x1, y1, x2, y2]`: los argumentos de `Easing.bezier`. */',
    'export type CubicBezier = readonly [number, number, number, number];',
    '',
    '/** Sombra en la forma del `boxShadow` de React Native (Nueva Arquitectura). */',
    'export interface BoxShadow {',
    '  offsetX: number;',
    '  offsetY: number;',
    '  blurRadius: number;',
    '  spreadDistance: number;',
    '  color: string;',
    '  inset?: boolean;',
    '}',
    '',
    '/** Tema resuelto: valores nativos de todos los tokens emitidos. */',
    renderThemeInterface(baseDefault),
    '',
    'type DeepPartial<T> = {',
    '  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];',
    '};',
    '',
    '/** Subconjunto de tokens que una marca sobrescribe sobre un tema. */',
    'export type ThemeOverrides = DeepPartial<Theme>;',
    '',
  ].join('\n');
}
