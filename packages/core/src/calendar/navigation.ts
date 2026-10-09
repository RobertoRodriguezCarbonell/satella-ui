import type { Weekday } from '../types/calendar';
import { addDays, addMonths, getWeekday } from './dates';

/**
 * Hacia dónde mueve el foco una tecla en la rejilla de fechas, según el patrón de ARIA:
 * las flechas, Inicio y Fin, RePág y AvPág, y estas dos con Mayúsculas.
 */
export const calendarDirections = [
  'previousDay',
  'nextDay',
  'previousWeek',
  'nextWeek',
  'weekStart',
  'weekEnd',
  'previousMonth',
  'nextMonth',
  'previousYear',
  'nextYear',
] as const;
export type CalendarDirection = (typeof calendarDirections)[number];

const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;

/** La fecha a la que lleva una tecla desde la actual. No mira límites: eso es cosa de quien llama. */
export function getDateInDirection(
  date: string,
  direction: CalendarDirection,
  weekStartsOn: Weekday = 1,
): string {
  // Cuántos días lleva la semana cuando llega a esta fecha.
  const elapsed = (getWeekday(date) - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  switch (direction) {
    case 'previousDay':
      return addDays(date, -1);
    case 'nextDay':
      return addDays(date, 1);
    case 'previousWeek':
      return addDays(date, -DAYS_IN_WEEK);
    case 'nextWeek':
      return addDays(date, DAYS_IN_WEEK);
    case 'weekStart':
      return addDays(date, -elapsed);
    case 'weekEnd':
      return addDays(date, DAYS_IN_WEEK - 1 - elapsed);
    case 'previousMonth':
      return addMonths(date, -1);
    case 'nextMonth':
      return addMonths(date, 1);
    case 'previousYear':
      return addMonths(date, -MONTHS_IN_YEAR);
    case 'nextYear':
      return addMonths(date, MONTHS_IN_YEAR);
  }
}
