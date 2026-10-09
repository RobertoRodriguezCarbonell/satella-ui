import type { Weekday } from '../types/calendar';

// Fechas como texto ISO (ADR-046): `'2026-10-09'` para un día y `'2026-10'` para un mes.
// La aritmética pasa por `Date` en UTC, donde un día siempre dura 24 horas: ni la zona
// horaria ni el cambio de hora de quien ejecuta el código pueden mover una fecha.

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const DAYS_IN_WEEK = 7;
/** Seis semanas: las que ocupa el mes más largo que empieza a final de semana. */
const WEEKS_IN_GRID = 6;

/** Una fecha descompuesta. El mes va de 1 a 12. */
export interface DateParts {
  year: number;
  month: number;
  day: number;
}

function utc(year: number, month: number, day: number): Date {
  const date = new Date(0);
  // `setUTCFullYear` y no `Date.UTC`, que lee los años 0 a 99 como 1900 a 1999.
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

function fromUTC(date: Date): string {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}`;
}

/**
 * La fecha ISO de un año, un mes (1 a 12) y un día. Lo que se sale de rango pasa al mes
 * o al año que toca: el día 0 es el último del mes anterior.
 */
export function toISODate(year: number, month: number, day: number): string {
  return fromUTC(utc(year, month, day));
}

/** Las partes de una fecha ISO, o `undefined` si el texto no es una fecha que exista. */
export function parseISODate(value: string): DateParts | undefined {
  const match = DATE_PATTERN.exec(value);
  if (match === null) return undefined;
  const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  // El 30 de febrero tiene el formato de una fecha, pero no lo es.
  return toISODate(parts.year, parts.month, parts.day) === value ? parts : undefined;
}

/** Si el texto es una fecha ISO que existe. */
export function isISODate(value: string | undefined): value is string {
  return value !== undefined && parseISODate(value) !== undefined;
}

/** Si el texto es un mes ISO (`'2026-10'`). */
export function isISOMonth(value: string | undefined): value is string {
  if (value === undefined) return false;
  const match = MONTH_PATTERN.exec(value);
  if (match === null) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

/** El mes de una fecha: `'2026-10-09'` → `'2026-10'`. */
export function toMonth(date: string): string {
  return date.slice(0, 7);
}

/** La fecha de hoy según el reloj y la zona horaria del dispositivo. */
export function todayISO(now: Date = new Date()): string {
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** La fecha que cae `amount` días después (o antes, si es negativo). */
export function addDays(date: string, amount: number): string {
  const parts = parseISODate(date);
  if (parts === undefined) return date;
  return toISODate(parts.year, parts.month, parts.day + amount);
}

/** Cuántos días tiene un mes (`'2026-02'` → 28). */
export function getDaysInMonth(month: string): number {
  const parts = parseISODate(`${month}-01`);
  if (parts === undefined) return 0;
  // El día 0 del mes siguiente es el último de este.
  return utc(parts.year, parts.month + 1, 0).getUTCDate();
}

/** El mes que cae `amount` meses después (o antes): `'2026-12'` + 1 → `'2027-01'`. */
export function shiftMonth(month: string, amount: number): string {
  const parts = parseISODate(`${month}-01`);
  if (parts === undefined) return month;
  return toMonth(toISODate(parts.year, parts.month + amount, 1));
}

/**
 * El mismo día `amount` meses después (o antes). Si ese mes es más corto, el último que
 * tenga: del 31 de enero se pasa al 28 de febrero, no al 3 de marzo.
 */
export function addMonths(date: string, amount: number): string {
  const parts = parseISODate(date);
  if (parts === undefined) return date;
  const month = shiftMonth(toMonth(date), amount);
  return `${month}-${pad(Math.min(parts.day, getDaysInMonth(month)), 2)}`;
}

/** El día de la semana de una fecha: 0 es domingo. */
export function getWeekday(date: string): Weekday {
  const parts = parseISODate(date);
  if (parts === undefined) return 0;
  return utc(parts.year, parts.month, parts.day).getUTCDay() as Weekday;
}

/** Los siete días de la semana en el orden en que se pintan, a partir del primero. */
export function getWeekdays(weekStartsOn: Weekday = 1): Weekday[] {
  return Array.from(
    { length: DAYS_IN_WEEK },
    (_, index) => ((weekStartsOn + index) % DAYS_IN_WEEK) as Weekday,
  );
}

/**
 * Las semanas de un mes para pintarlo en una rejilla de siete columnas: cada fecha en
 * la columna de su día de la semana y `null` en los huecos de antes y de después.
 * Siempre son seis filas, para que la altura no cambie de un mes a otro.
 */
export function getMonthWeeks(month: string, weekStartsOn: Weekday = 1): (string | null)[][] {
  const days = getDaysInMonth(month);
  // Cuántos huecos hay antes del día 1.
  const offset =
    days === 0 ? 0 : (getWeekday(`${month}-01`) - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  return Array.from({ length: WEEKS_IN_GRID }, (_week, week) =>
    Array.from({ length: DAYS_IN_WEEK }, (_cell, column) => {
      const day = week * DAYS_IN_WEEK + column - offset + 1;
      return day >= 1 && day <= days ? `${month}-${pad(day, 2)}` : null;
    }),
  );
}

/** La fecha más cercana a `date` entre `min` y `max`, los dos incluidos y opcionales. */
export function clampDate(date: string, min?: string, max?: string): string {
  // Dos fechas ISO se comparan como texto.
  if (isISODate(min) && date < min) return min;
  if (isISODate(max) && date > max) return max;
  return date;
}
