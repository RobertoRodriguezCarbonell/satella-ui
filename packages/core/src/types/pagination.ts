import type { ControlSize } from './control';

/**
 * Tamaños de `Pagination` (ADR-009): los de un control, sin el grande. `sm` acompaña a
 * una `Table` compacta y cabe mejor en un móvil.
 */
export const paginationSizes = ['sm', 'md'] as const satisfies readonly ControlSize[];
export type PaginationSize = (typeof paginationSizes)[number];

/**
 * Contrato de `Pagination`: moverse entre las páginas de un listado (ADR-045). No sabe
 * nada de los datos: la app le dice cuántas páginas hay y en cuál está.
 */
export interface PaginationProps {
  /** Número de páginas. Con una o ninguna, no hay adónde ir y los botones se deshabilitan. */
  pageCount: number;
  /** Página actual, empezando en 1, controlada por la app. Sin ella, guarda su estado (ADR-037). */
  page?: number | undefined;
  /** Página inicial cuando guarda su propio estado (por defecto 1). */
  defaultPage?: number | undefined;
  /** Se llama con la página a la que se quiere ir. */
  onPageChange?: ((page: number) => void) | undefined;
  /** Cuántas páginas se muestran a cada lado de la actual (por defecto 1). */
  siblingCount?: number | undefined;
  size?: PaginationSize | undefined;
  /** No se puede pulsar ni enfocar, por ejemplo mientras se carga la página pedida. */
  disabled?: boolean | undefined;
  /** Nombre accesible del grupo ("Páginas de pedidos"). */
  accessibilityLabel: string;
  /** Nombre accesible del botón de la página anterior ("Página anterior"). */
  previousLabel: string;
  /** Nombre accesible del botón de la página siguiente ("Página siguiente"). */
  nextLabel: string;
  /** Nombre accesible del botón de una página ("Página 3"). Sin él, es el propio número. */
  getPageLabel?: ((page: number) => string) | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
