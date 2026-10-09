import type { DateRange } from '../types/calendar';

/** Un periodo sin ninguna fecha elegida. */
export const EMPTY_RANGE: DateRange = { start: '', end: '' };

/** Si el periodo tiene inicio y final. */
export function isRangeComplete(range: DateRange): boolean {
  return range.start !== '' && range.end !== '';
}

/**
 * El periodo que resulta de pulsar una fecha: sin inicio, o con el periodo ya completo,
 * la fecha empieza uno nuevo; con el inicio puesto, lo cierra. Las dos fechas quedan en
 * orden aunque la segunda sea anterior a la primera.
 */
export function getNextRange(current: DateRange, date: string): DateRange {
  if (current.start === '' || current.end !== '') return { start: date, end: '' };
  return date < current.start
    ? { start: date, end: current.start }
    : { start: current.start, end: date };
}

/** Si la fecha cae dentro del periodo, extremos incluidos. Un periodo a medias no contiene nada. */
export function isDateInRange(date: string, range: DateRange): boolean {
  return isRangeComplete(range) && date >= range.start && date <= range.end;
}
