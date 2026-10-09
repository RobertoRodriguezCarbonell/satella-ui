import { describe, expect, it } from 'vitest';

import {
  addDays,
  addMonths,
  clampDate,
  getDaysInMonth,
  getMonthWeeks,
  getWeekday,
  getWeekdays,
  isISODate,
  isISOMonth,
  parseISODate,
  shiftMonth,
  toISODate,
  todayISO,
  toMonth,
} from './dates';

describe('toISODate y parseISODate', () => {
  it('escriben y leen una fecha con ceros a la izquierda', () => {
    expect(toISODate(2026, 10, 9)).toBe('2026-10-09');
    expect(toISODate(2026, 1, 5)).toBe('2026-01-05');
    expect(parseISODate('2026-10-09')).toEqual({ year: 2026, month: 10, day: 9 });
  });

  it('lo que se sale de rango pasa al mes o al año que toca', () => {
    expect(toISODate(2026, 13, 1)).toBe('2027-01-01');
    expect(toISODate(2026, 3, 0)).toBe('2026-02-28');
    expect(toISODate(2026, 1, 32)).toBe('2026-02-01');
  });

  it('los años de menos de cuatro cifras no se confunden con los de 1900', () => {
    expect(toISODate(99, 1, 1)).toBe('0099-01-01');
    expect(parseISODate('0099-01-01')).toEqual({ year: 99, month: 1, day: 1 });
  });

  it('rechazan lo que no es una fecha que exista', () => {
    expect(parseISODate('2026-02-30')).toBeUndefined();
    expect(parseISODate('2026-13-01')).toBeUndefined();
    expect(parseISODate('2026-10-9')).toBeUndefined();
    expect(parseISODate('09/10/2026')).toBeUndefined();
    expect(parseISODate('')).toBeUndefined();
  });

  it('conocen los años bisiestos', () => {
    expect(parseISODate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
    expect(parseISODate('2026-02-29')).toBeUndefined();
    expect(parseISODate('2100-02-29')).toBeUndefined();
    expect(parseISODate('2000-02-29')).toBeDefined();
  });
});

describe('isISODate e isISOMonth', () => {
  it('reconocen fechas y meses', () => {
    expect(isISODate('2026-10-09')).toBe(true);
    expect(isISODate('2026-10')).toBe(false);
    expect(isISODate('')).toBe(false);
    expect(isISODate(undefined)).toBe(false);
    expect(isISOMonth('2026-10')).toBe(true);
    expect(isISOMonth('2026-13')).toBe(false);
    expect(isISOMonth('2026-00')).toBe(false);
    expect(isISOMonth('2026-10-09')).toBe(false);
    expect(isISOMonth(undefined)).toBe(false);
  });
});

describe('toMonth y todayISO', () => {
  it('toMonth se queda con el año y el mes', () => {
    expect(toMonth('2026-10-09')).toBe('2026-10');
  });

  it('todayISO usa el día local del reloj, no el de UTC', () => {
    // Las 23:30 del 31 de diciembre en la zona de quien ejecuta el test.
    expect(todayISO(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31');
    expect(todayISO(new Date(2026, 0, 1, 0, 15))).toBe('2026-01-01');
    expect(isISODate(todayISO())).toBe(true);
  });
});

describe('addDays', () => {
  it('cruza meses y años', () => {
    expect(addDays('2026-10-09', 1)).toBe('2026-10-10');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-10-09', 0)).toBe('2026-10-09');
  });

  it('no pierde un día en los cambios de hora', () => {
    // En España la hora cambia el 29 de marzo y el 25 de octubre de 2026.
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDays('2026-10-26', -2)).toBe('2026-10-24');
  });

  it('un año entero', () => {
    expect(addDays('2026-01-01', 365)).toBe('2027-01-01');
    expect(addDays('2028-01-01', 366)).toBe('2029-01-01');
  });

  it('deja como está lo que no es una fecha', () => {
    expect(addDays('', 1)).toBe('');
    expect(addDays('mañana', 1)).toBe('mañana');
  });
});

describe('getDaysInMonth y shiftMonth', () => {
  it('cuenta los días de cada mes', () => {
    expect(getDaysInMonth('2026-01')).toBe(31);
    expect(getDaysInMonth('2026-02')).toBe(28);
    expect(getDaysInMonth('2028-02')).toBe(29);
    expect(getDaysInMonth('2026-04')).toBe(30);
    expect(getDaysInMonth('2026-12')).toBe(31);
    expect(getDaysInMonth('nada')).toBe(0);
  });

  it('avanza y retrocede meses cruzando el año', () => {
    expect(shiftMonth('2026-10', 1)).toBe('2026-11');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-10', 14)).toBe('2027-12');
    expect(shiftMonth('2026-10', -12)).toBe('2025-10');
    expect(shiftMonth('nada', 1)).toBe('nada');
  });
});

describe('addMonths', () => {
  it('conserva el día del mes', () => {
    expect(addMonths('2026-10-09', 1)).toBe('2026-11-09');
    expect(addMonths('2026-10-09', -10)).toBe('2025-12-09');
    expect(addMonths('2026-10-09', 12)).toBe('2027-10-09');
  });

  it('si el mes de destino es más corto, se queda en su último día', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(addMonths('2026-10-31', 1)).toBe('2026-11-30');
    expect(addMonths('2028-02-29', 12)).toBe('2029-02-28');
  });

  it('deja como está lo que no es una fecha', () => {
    expect(addMonths('', 1)).toBe('');
  });
});

describe('getWeekday y getWeekdays', () => {
  it('da el día de la semana con el domingo como 0', () => {
    expect(getWeekday('2026-10-09')).toBe(5); // viernes
    expect(getWeekday('2026-10-11')).toBe(0); // domingo
    expect(getWeekday('2026-10-12')).toBe(1); // lunes
    expect(getWeekday('nada')).toBe(0);
  });

  it('ordena la semana a partir de su primer día, lunes por defecto', () => {
    expect(getWeekdays()).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(getWeekdays(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(getWeekdays(6)).toEqual([6, 0, 1, 2, 3, 4, 5]);
  });
});

describe('getMonthWeeks', () => {
  it('siempre da seis semanas de siete huecos', () => {
    for (const month of ['2026-02', '2026-10', '2026-08', '2027-02']) {
      const weeks = getMonthWeeks(month);
      expect(weeks).toHaveLength(6);
      for (const week of weeks) expect(week).toHaveLength(7);
    }
  });

  it('coloca el día 1 en la columna de su día de la semana', () => {
    // El 1 de octubre de 2026 es jueves: con la semana en lunes, la cuarta columna.
    const weeks = getMonthWeeks('2026-10');
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(weeks[4]).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      null,
    ]);
    expect(weeks[5]).toEqual([null, null, null, null, null, null, null]);
  });

  it('con la semana en domingo, el día 1 se mueve una columna', () => {
    expect(getMonthWeeks('2026-10', 0)[0]).toEqual([
      null,
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
  });

  it('contiene todos los días del mes, en orden y una sola vez', () => {
    for (const month of ['2026-02', '2028-02', '2026-03', '2026-11']) {
      const days = getMonthWeeks(month)
        .flat()
        .filter((date) => date !== null);
      expect(days).toHaveLength(getDaysInMonth(month));
      expect(days).toEqual([...days].sort());
      expect(new Set(days).size).toBe(days.length);
    }
  });

  it('un mes que empieza en domingo con la semana en lunes ocupa las seis filas', () => {
    // El 1 de agosto de 2027 es domingo.
    const weeks = getMonthWeeks('2027-08');
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2027-08-01']);
    expect(weeks[5]?.slice(0, 2)).toEqual(['2027-08-30', '2027-08-31']);
  });

  it('un mes que no existe no tiene días', () => {
    expect(
      getMonthWeeks('nada')
        .flat()
        .every((date) => date === null),
    ).toBe(true);
  });
});

describe('clampDate', () => {
  it('lleva la fecha al límite más cercano', () => {
    expect(clampDate('2026-10-09', '2026-10-15', '2026-10-20')).toBe('2026-10-15');
    expect(clampDate('2026-10-25', '2026-10-15', '2026-10-20')).toBe('2026-10-20');
    expect(clampDate('2026-10-17', '2026-10-15', '2026-10-20')).toBe('2026-10-17');
  });

  it('sin límites, o con límites que no son fechas, no cambia nada', () => {
    expect(clampDate('2026-10-09')).toBe('2026-10-09');
    expect(clampDate('2026-10-09', '', '')).toBe('2026-10-09');
    expect(clampDate('2026-10-09', 'ayer', 'mañana')).toBe('2026-10-09');
  });
});
