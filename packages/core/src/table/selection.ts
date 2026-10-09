/** Cuántas de las filas que se ven están elegidas: ninguna, algunas o todas. */
export const selectionStates = ['none', 'some', 'all'] as const;
export type SelectionState = (typeof selectionStates)[number];

/**
 * El estado de la casilla de la cabecera. `keys` son las filas que se ven; `selected`
 * puede traer además claves de otras páginas, que no cuentan. Sin filas, `none`.
 */
export function getSelectionState(
  keys: readonly string[],
  selected: readonly string[],
): SelectionState {
  const chosen = new Set(selected);
  const count = keys.filter((key) => chosen.has(key)).length;
  if (count === 0) return 'none';
  return count === keys.length ? 'all' : 'some';
}

/** Marca o desmarca una fila. Las demás claves conservan su orden. */
export function toggleSelectedKey(selected: readonly string[], key: string): string[] {
  return selected.includes(key) ? selected.filter((other) => other !== key) : [...selected, key];
}

/**
 * Lo que hace la casilla de la cabecera: si todas las filas que se ven están elegidas,
 * las desmarca; si no, marca las que faltan. Las claves de otras páginas no se tocan.
 */
export function toggleAllSelected(keys: readonly string[], selected: readonly string[]): string[] {
  if (getSelectionState(keys, selected) === 'all') {
    const visible = new Set(keys);
    return selected.filter((key) => !visible.has(key));
  }
  const chosen = new Set(selected);
  return [...selected, ...keys.filter((key) => !chosen.has(key))];
}
