/** Lo mínimo que hace falta saber de una pestaña para moverse entre ellas. */
export interface NavigableTab {
  value: string;
  disabled?: boolean | undefined;
}

/** Hacia dónde mueve el foco una tecla: flechas, Inicio y Fin. */
export const tabDirections = ['next', 'previous', 'first', 'last'] as const;
export type TabDirection = (typeof tabDirections)[number];

/** La primera pestaña habilitada: la elegida por defecto. `undefined` si no hay ninguna. */
export function firstEnabledTab(items: readonly NavigableTab[]): string | undefined {
  return items.find((item) => item.disabled !== true)?.value;
}

/**
 * La pestaña a la que lleva una tecla desde la actual, saltando las deshabilitadas.
 * `next` y `previous` dan la vuelta al llegar al final. Si no hay otra a la que ir,
 * devuelve la actual.
 */
export function getTabInDirection(
  items: readonly NavigableTab[],
  current: string,
  direction: TabDirection,
): string {
  const enabled = items.filter((item) => item.disabled !== true).map((item) => item.value);
  if (enabled.length === 0) return current;
  const [first] = enabled;
  const last = enabled[enabled.length - 1];
  if (first === undefined || last === undefined) return current;
  if (direction === 'first') return first;
  if (direction === 'last') return last;

  const index = enabled.indexOf(current);
  // La actual puede estar deshabilitada o no existir: se entra por el extremo que toca.
  if (index === -1) return direction === 'next' ? first : last;
  const step = direction === 'next' ? 1 : -1;
  return enabled[(index + step + enabled.length) % enabled.length] ?? current;
}
