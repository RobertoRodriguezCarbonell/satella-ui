import type { TextVariant } from './text';

/**
 * Formas de `Skeleton` (ADR-009): `text` ocupa el hueco de una línea de `Text`,
 * `rectangle` el de una imagen o un control, y `circle` el de un avatar.
 */
export const skeletonShapes = ['text', 'rectangle', 'circle'] as const;
export type SkeletonShape = (typeof skeletonShapes)[number];

/**
 * Contrato de `Skeleton`: el hueco de un contenido que todavía se está cargando. Es
 * decorativo; que la zona está cargando lo comunica quien lo contiene.
 */
export interface SkeletonProps {
  /** Forma (por defecto `text`). */
  shape?: SkeletonShape | undefined;
  /**
   * Ancho, en puntos o como porcentaje del contenedor (`'60%'`). Por defecto ocupa
   * todo el ancho; en `circle`, mide lo mismo que de alto.
   */
  width?: number | `${number}%` | undefined;
  /** Alto en puntos. En `text` no se usa: lo fija `variant`. */
  height?: number | undefined;
  /** Con `text`: la variante de `Text` cuyo hueco ocupa (por defecto `body`). */
  variant?: TextVariant | undefined;
  /** Con `text`: número de líneas (por defecto 1). Si hay varias, la última es más corta. */
  lines?: number | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
