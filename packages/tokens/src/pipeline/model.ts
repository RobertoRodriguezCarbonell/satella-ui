/**
 * Modelo interno del pipeline: tipos DTCG 2025.10 que soporta el build y la
 * forma de un token ya resuelto (sin referencias) que devuelve Style Dictionary.
 */

export const SUPPORTED_TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'shadow',
] as const;

export type DtcgTokenType = (typeof SUPPORTED_TYPES)[number];

export function isSupportedType(type: unknown): type is DtcgTokenType {
  return typeof type === 'string' && (SUPPORTED_TYPES as readonly string[]).includes(type);
}

/** Módulo de color de DTCG 2025.10. Solo se soporta el espacio `srgb`. */
export interface DtcgColorValue {
  colorSpace: string;
  components: (number | 'none')[];
  alpha?: number | 'none';
  hex?: string;
}

export interface DtcgDimensionValue {
  value: number;
  unit: 'px' | 'rem';
}

export interface DtcgDurationValue {
  value: number;
  unit: 'ms' | 's';
}

/** Los cuatro números de una curva de Bézier cúbica: `[x1, y1, x2, y2]`. */
export type DtcgCubicBezierValue = [number, number, number, number];

export type DtcgFontFamilyValue = string | string[];

export type DtcgFontWeightValue = number | string;

export interface DtcgShadowLayer {
  color: DtcgColorValue;
  offsetX: DtcgDimensionValue;
  offsetY: DtcgDimensionValue;
  blur: DtcgDimensionValue;
  spread: DtcgDimensionValue;
  inset?: boolean;
}

export type DtcgShadowValue = DtcgShadowLayer | DtcgShadowLayer[];

/** Clave de `$extensions` propia de este paquete (notación de dominio inverso, como pide la spec). */
export const EXTENSION_KEY = 'com.satellatickets.tokens';

/** Ajustes por token que no caben en la spec: unidad CSS y familia tipográfica nativa. */
export interface TokenExtensions {
  css?: { unit?: 'px' | 'rem' };
  native?: { fontFamily?: string | null };
}

/** Token con las referencias ya resueltas. `value` conserva la forma DTCG original. */
export interface ResolvedToken {
  /** Ruta separada por puntos: `color.action.primary`. */
  name: string;
  path: readonly string[];
  type: DtcgTokenType;
  value: unknown;
  description?: string;
  extensions?: TokenExtensions;
  /** `true` si el token viene de un fichero `source` (overrides de marca) y no de `include`. */
  isSource: boolean;
  filePath: string;
}

/** Conjunto de tokens indexado por nombre, en orden de declaración. */
export type TokenMap = Map<string, ResolvedToken>;

/** Grupo raíz que nunca se emite: la paleta en bruto (ADR-005). */
export const PRIVATE_ROOT = 'palette';

export function isEmitted(token: ResolvedToken): boolean {
  return token.path[0] !== PRIVATE_ROOT;
}

/** Forma del `boxShadow` de React Native (Nueva Arquitectura), sin depender de sus tipos. */
export interface BoxShadow {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadDistance: number;
  color: string;
  inset?: boolean;
}

export type NativeValue = string | number | undefined | BoxShadow[] | DtcgCubicBezierValue;
