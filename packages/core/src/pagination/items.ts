/** Lo que pinta `Pagination` entre anterior y siguiente: un número de página o un salto. */
export type PaginationItem =
  | { type: 'page'; page: number }
  /** Páginas que no se muestran. `position` distingue el salto del principio del del final. */
  | { type: 'ellipsis'; position: 'start' | 'end' };

export interface PaginationItemsOptions {
  /** Página actual, empezando en 1. */
  page: number;
  pageCount: number;
  /** Cuántas páginas se muestran a cada lado de la actual (por defecto 1). */
  siblingCount?: number | undefined;
}

/** La página más cercana a `page` que existe. Sin páginas, la 1. */
export function clampPage(page: number, pageCount: number): number {
  const last = Math.max(1, Math.floor(pageCount));
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), last);
}

function range(from: number, to: number): PaginationItem[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => ({
    type: 'page' as const,
    page: from + index,
  }));
}

/**
 * Las páginas que se muestran: la primera, la última, la actual y sus vecinas, con un
 * salto donde se omiten varias. Si caben todas, van todas.
 *
 * Cuando hay saltos, el número de elementos es siempre el mismo (`siblingCount * 2 + 5`),
 * esté donde esté la página actual: así los botones no cambian de sitio al pasar de página.
 * Un salto nunca sustituye a una sola página: en su lugar va esa página.
 */
export function getPaginationItems({
  page,
  pageCount,
  siblingCount = 1,
}: PaginationItemsOptions): PaginationItem[] {
  const last = Math.max(0, Math.floor(pageCount));
  const siblings = Math.max(0, Math.floor(siblingCount));
  if (last <= siblings * 2 + 5) return range(1, last);

  const current = clampPage(page, last);
  // El tramo central: la actual y sus vecinas, sin acercarse a menos de dos de un extremo.
  const from = Math.max(Math.min(current - siblings, last - siblings * 2 - 2), 3);
  const to = Math.min(Math.max(current + siblings, siblings * 2 + 3), last - 2);

  return [
    { type: 'page', page: 1 },
    from > 3 ? { type: 'ellipsis', position: 'start' } : { type: 'page', page: 2 },
    ...range(from, to),
    to < last - 2 ? { type: 'ellipsis', position: 'end' } : { type: 'page', page: last - 1 },
    { type: 'page', page: last },
  ];
}
