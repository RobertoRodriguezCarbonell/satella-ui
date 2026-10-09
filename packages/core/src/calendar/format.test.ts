import { describe, expect, it } from 'vitest';

import { weekdays } from '../types/calendar';
import { createCalendarFormatter } from './format';

describe('createCalendarFormatter', () => {
  const es = createCalendarFormatter('es');
  const en = createCalendarFormatter('en-GB');

  it('escribe el título del mes empezando en mayúscula', () => {
    expect(es.month('2026-10')).toBe('Octubre de 2026');
    expect(es.month('2027-01')).toBe('Enero de 2027');
    expect(en.month('2026-10')).toBe('October 2026');
  });

  it('escribe los días de la semana con el domingo como 0', () => {
    expect(weekdays.map((day) => es.weekdayLong(day))).toEqual([
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
    ]);
    expect(weekdays.map((day) => es.weekdayNarrow(day))).toEqual([
      'D',
      'L',
      'M',
      'X',
      'J',
      'V',
      'S',
    ]);
    expect(en.weekdayLong(1)).toBe('Monday');
  });

  it('escribe una fecha con todas sus palabras', () => {
    expect(es.dateLong('2026-10-09')).toBe('viernes, 9 de octubre de 2026');
    // La puntuación del inglés cambia de una versión de los datos de idioma a otra.
    expect(en.dateLong('2026-10-09')).toMatch(/^Friday,? 9 October 2026$/);
  });

  it('escribe una fecha abreviada', () => {
    // El punto de la abreviatura depende de la versión de los datos de idioma.
    expect(es.dateMedium('2026-10-09')).toMatch(/^9 oct\.? 2026$/);
    expect(en.dateMedium('2026-10-09')).toMatch(/^9 Oct 2026$/);
  });

  it('no depende de la zona horaria: el día escrito es el día pedido', () => {
    // Primer y último día del año, donde un desfase de horas cambiaría de año.
    expect(es.dateLong('2026-01-01')).toBe('jueves, 1 de enero de 2026');
    expect(es.dateLong('2026-12-31')).toBe('jueves, 31 de diciembre de 2026');
  });

  it('lo que no es una fecha se escribe vacío', () => {
    expect(es.dateLong('')).toBe('');
    expect(es.dateMedium('2026-02-30')).toBe('');
    expect(es.month('nada')).toBe('');
  });
});
