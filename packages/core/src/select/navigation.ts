/** Lo mínimo que hace falta saber de una opción para moverse entre ellas y buscarla. */
export interface NavigableOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

/** Hacia dónde mueve el resaltado una tecla: flechas, Inicio, Fin, AvPág y RePág. */
export const optionDirections = [
  'next',
  'previous',
  'first',
  'last',
  'nextPage',
  'previousPage',
] as const;
export type OptionDirection = (typeof optionDirections)[number];

/** Cuántas opciones salta AvPág o RePág. */
export const OPTION_PAGE_SIZE = 10;

const steps = {
  next: 1,
  previous: -1,
  nextPage: OPTION_PAGE_SIZE,
  previousPage: -OPTION_PAGE_SIZE,
} satisfies Record<Exclude<OptionDirection, 'first' | 'last'>, number>;

/**
 * La opción a la que lleva una tecla desde la actual, saltando las deshabilitadas. No da
 * la vuelta: al llegar a un extremo se queda en él (ADR-042). Si no hay ninguna a la
 * que ir, devuelve la actual.
 */
export function getOptionInDirection(
  options: readonly NavigableOption[],
  current: string | undefined,
  direction: OptionDirection,
): string | undefined {
  const enabled = options.filter((option) => option.disabled !== true).map(({ value }) => value);
  const [first] = enabled;
  const last = enabled[enabled.length - 1];
  if (first === undefined || last === undefined) return current;
  if (direction === 'first') return first;
  if (direction === 'last') return last;

  const step = steps[direction];
  const index = current === undefined ? -1 : enabled.indexOf(current);
  // Sin opción actual, o si está deshabilitada, se entra por el extremo que toca.
  if (index === -1) return step > 0 ? first : last;
  return enabled[Math.min(Math.max(index + step, 0), enabled.length - 1)] ?? current;
}

/** Sin mayúsculas ni acentos: al escribir "avila" se encuentra "Ávila". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
}

/**
 * La opción habilitada cuyo texto empieza por lo que el usuario ha escrito, o `undefined`
 * si no hay ninguna.
 *
 * - Una sola letra busca a partir de la siguiente a la actual, así que pulsarla varias
 *   veces recorre las que empiezan por ella.
 * - Un texto más largo se queda en la actual mientras siga coincidiendo.
 * - La misma letra repetida ("bb") que no es el principio de ninguna opción vale como
 *   pulsarla otra vez.
 */
export function findOptionByText(
  options: readonly NavigableOption[],
  text: string,
  current?: string,
): string | undefined {
  const query = normalize(text);
  const [letter] = query;
  if (letter === undefined) return undefined;

  const enabled = options.filter((option) => option.disabled !== true);
  const index = enabled.findIndex((option) => option.value === current);
  const startingWith = (prefix: string, from: number) =>
    [...enabled.slice(from), ...enabled.slice(0, from)].find((option) =>
      normalize(option.label).startsWith(prefix),
    )?.value;

  if (query.length === 1) return startingWith(letter, index + 1);
  const match = startingWith(query, Math.max(index, 0));
  if (match !== undefined) return match;
  return [...query].every((char) => char === letter) ? startingWith(letter, index + 1) : undefined;
}
