/**
 * Conversores de valores DTCG a cada plataforma (ADR-006): una sola definición
 * de unidades, tipografía y sombras para web (CSS) y React Native.
 *
 * Política de unidades en CSS: las dimensiones autoradas en px se emiten en rem
 * (escalan con la preferencia de tamaño de texto del usuario), salvo las que
 * declaran `$extensions["com.satellatickets.tokens"].css.unit = "px"` y las
 * dimensiones internas de una sombra, que se mantienen en px. En nativo todo
 * son números en puntos (px) y las duraciones, milisegundos.
 */
import { colorToHex } from './color.ts';
import type {
  BoxShadow,
  DtcgColorValue,
  DtcgDimensionValue,
  DtcgDurationValue,
  DtcgFontFamilyValue,
  DtcgFontWeightValue,
  DtcgShadowLayer,
  DtcgShadowValue,
  NativeValue,
  ResolvedToken,
  TokenExtensions,
} from './model.ts';

const REM_BASE = 16;

/** Familias genéricas de CSS que no existen como fuente en React Native. */
const GENERIC_FAMILIES = new Set([
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  'ui-rounded',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'emoji',
  'math',
  'fangsong',
]);

const FONT_WEIGHT_ALIASES: Record<string, number> = {
  thin: 100,
  hairline: 100,
  'extra-light': 200,
  'ultra-light': 200,
  light: 300,
  normal: 400,
  regular: 400,
  book: 400,
  medium: 500,
  'semi-bold': 600,
  'demi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  'ultra-bold': 800,
  black: 900,
  heavy: 900,
  'extra-black': 950,
  'ultra-black': 950,
};

function formatNumber(value: number): string {
  return String(Number(value.toFixed(4)));
}

export function dimensionToCss(value: DtcgDimensionValue, extensions?: TokenExtensions): string {
  if (value.value === 0) return '0';
  if (value.unit === 'rem' || extensions?.css?.unit === 'px') {
    return `${formatNumber(value.value)}${value.unit}`;
  }
  return `${formatNumber(value.value / REM_BASE)}rem`;
}

/** Dimensión tal cual se autoró (px o rem), sin pasar a rem: para sombras. */
export function dimensionToCssLiteral(value: DtcgDimensionValue): string {
  return value.value === 0 ? '0' : `${formatNumber(value.value)}${value.unit}`;
}

export function dimensionToNumber(value: DtcgDimensionValue): number {
  return value.unit === 'rem' ? value.value * REM_BASE : value.value;
}

function familyList(value: DtcgFontFamilyValue): string[] {
  return Array.isArray(value) ? value : [value];
}

export function fontFamilyToCss(value: DtcgFontFamilyValue): string {
  return familyList(value)
    .map((family) => (/^[\w-]+$/.test(family) ? family : `"${family.replaceAll('"', '\\"')}"`))
    .join(', ');
}

/**
 * React Native acepta una sola familia y no conoce las genéricas de CSS.
 * Si la pila empieza por una genérica, se emite `undefined` (fuente del sistema);
 * la extensión `native.fontFamily` permite fijar un valor explícito (o `null`).
 */
export function fontFamilyToNative(
  value: DtcgFontFamilyValue,
  extensions?: TokenExtensions,
): string | undefined {
  if (extensions?.native && 'fontFamily' in extensions.native) {
    return extensions.native.fontFamily ?? undefined;
  }
  const [first] = familyList(value);
  if (first === undefined || GENERIC_FAMILIES.has(first)) return undefined;
  return first;
}

export function fontWeightToNumber(value: DtcgFontWeightValue): number {
  if (typeof value === 'number') return value;
  const weight = FONT_WEIGHT_ALIASES[value];
  if (weight === undefined) throw new Error(`Peso tipográfico desconocido: "${value}".`);
  return weight;
}

export function durationToCss(value: DtcgDurationValue): string {
  return `${formatNumber(value.value)}${value.unit}`;
}

export function durationToMs(value: DtcgDurationValue): number {
  return value.unit === 's' ? value.value * 1000 : value.value;
}

function shadowLayers(value: DtcgShadowValue): DtcgShadowLayer[] {
  return Array.isArray(value) ? value : [value];
}

export function shadowToCss(value: DtcgShadowValue): string {
  return shadowLayers(value)
    .map((layer) =>
      [
        layer.inset ? 'inset' : '',
        dimensionToCssLiteral(layer.offsetX),
        dimensionToCssLiteral(layer.offsetY),
        dimensionToCssLiteral(layer.blur),
        dimensionToCssLiteral(layer.spread),
        colorToHex(layer.color),
      ]
        .filter(Boolean)
        .join(' '),
    )
    .join(', ');
}

export function shadowToNative(value: DtcgShadowValue): BoxShadow[] {
  return shadowLayers(value).map((layer) => ({
    offsetX: dimensionToNumber(layer.offsetX),
    offsetY: dimensionToNumber(layer.offsetY),
    blurRadius: dimensionToNumber(layer.blur),
    spreadDistance: dimensionToNumber(layer.spread),
    color: colorToHex(layer.color),
    ...(layer.inset ? { inset: true } : {}),
  }));
}

export function toCssValue(token: ResolvedToken): string {
  switch (token.type) {
    case 'color':
      return colorToHex(token.value as DtcgColorValue, token.name);
    case 'dimension':
      return dimensionToCss(token.value as DtcgDimensionValue, token.extensions);
    case 'fontFamily':
      return fontFamilyToCss(token.value as DtcgFontFamilyValue);
    case 'fontWeight':
      return String(fontWeightToNumber(token.value as DtcgFontWeightValue));
    case 'duration':
      return durationToCss(token.value as DtcgDurationValue);
    case 'number':
      return formatNumber(token.value as number);
    case 'shadow':
      return shadowToCss(token.value as DtcgShadowValue);
  }
}

export function toNativeValue(token: ResolvedToken): NativeValue {
  switch (token.type) {
    case 'color':
      return colorToHex(token.value as DtcgColorValue, token.name);
    case 'dimension':
      return dimensionToNumber(token.value as DtcgDimensionValue);
    case 'fontFamily':
      return fontFamilyToNative(token.value as DtcgFontFamilyValue, token.extensions);
    case 'fontWeight':
      return String(fontWeightToNumber(token.value as DtcgFontWeightValue));
    case 'duration':
      return durationToMs(token.value as DtcgDurationValue);
    case 'number':
      return token.value as number;
    case 'shadow':
      return shadowToNative(token.value as DtcgShadowValue);
  }
}

/** Tipo TypeScript del valor nativo de cada tipo de token, para `dist/types.ts`. */
export function nativeTypeName(type: ResolvedToken['type']): string {
  switch (type) {
    case 'color':
      return 'string';
    case 'dimension':
    case 'duration':
    case 'number':
      return 'number';
    case 'fontFamily':
      return 'string | undefined';
    case 'fontWeight':
      return 'FontWeight';
    case 'shadow':
      return 'BoxShadow[]';
  }
}
