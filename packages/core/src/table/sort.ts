import type { TableSort } from '../types/table';

/**
 * El orden que pide una pulsación sobre la cabecera de una columna: ascendente si no
 * estaba ordenada por ella, y el sentido contrario si ya lo estaba. No hay un tercer
 * paso "sin ordenar": el orden de partida lo decide la app con `sort` o `defaultSort`.
 */
export function getNextSort(current: TableSort | null | undefined, column: string): TableSort {
  const ascending = current?.column === column && current.direction === 'ascending';
  return { column, direction: ascending ? 'descending' : 'ascending' };
}
