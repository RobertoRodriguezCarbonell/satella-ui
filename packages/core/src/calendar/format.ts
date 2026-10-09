import type { Weekday } from '../types/calendar';
import { parseISODate } from './dates';

/** Los textos de un calendario en un idioma. Los escribe `Intl`: la librería no trae ninguno. */
export interface CalendarFormatter {
  /** El título de un mes: `'2026-10'` → "Octubre de 2026". */
  month: (month: string) => string;
  /** La inicial de un día de la semana, para la cabecera de la rejilla: "L". */
  weekdayNarrow: (weekday: Weekday) => string;
  /** El nombre de un día de la semana: "lunes". */
  weekdayLong: (weekday: Weekday) => string;
  /** Una fecha con todas sus palabras, para los lectores de pantalla: "viernes, 9 de octubre de 2026". */
  dateLong: (date: string) => string;
  /** Una fecha abreviada, para un campo: "9 oct 2026". */
  dateMedium: (date: string) => string;
}

// Las fechas son días, no instantes (ADR-046): se construyen y se escriben en UTC para
// que la zona horaria de quien ejecuta el código no las mueva.
const timeZone = 'UTC';

/** El 4 de enero de 1970 fue domingo: sumándole un día de la semana da una fecha que cae en él. */
const FIRST_SUNDAY = 4;

function toDate(date: string): Date | undefined {
  const parts = parseISODate(date);
  if (parts === undefined) return undefined;
  const result = new Date(0);
  result.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return result;
}

function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** Los textos de un calendario en un idioma. Un texto que no es una fecha se escribe vacío. */
export function createCalendarFormatter(locale: string): CalendarFormatter {
  const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone });
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone });
  const dateLong = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  });
  const dateMedium = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
  });
  const write = (format: Intl.DateTimeFormat, date: string) => {
    const value = toDate(date);
    return value === undefined ? '' : format.format(value);
  };
  const weekday = (format: Intl.DateTimeFormat, day: Weekday) =>
    format.format(new Date(Date.UTC(1970, 0, FIRST_SUNDAY + day)));

  return {
    // En español `Intl` escribe el mes en minúscula; como título empieza en mayúscula.
    month: (value) => capitalize(write(month, `${value}-01`), locale),
    weekdayNarrow: (day) => weekday(narrow, day),
    weekdayLong: (day) => weekday(long, day),
    dateLong: (date) => write(dateLong, date),
    dateMedium: (date) => write(dateMedium, date),
  };
}
