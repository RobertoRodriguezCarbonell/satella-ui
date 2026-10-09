import { describe, expect, it } from 'vitest';

import { calendarDirections, getDateInDirection } from './navigation';

// El 9 de octubre de 2026 es viernes.
const FRIDAY = '2026-10-09';

describe('getDateInDirection', () => {
  it('las flechas mueven un día o una semana', () => {
    expect(getDateInDirection(FRIDAY, 'previousDay')).toBe('2026-10-08');
    expect(getDateInDirection(FRIDAY, 'nextDay')).toBe('2026-10-10');
    expect(getDateInDirection(FRIDAY, 'previousWeek')).toBe('2026-10-02');
    expect(getDateInDirection(FRIDAY, 'nextWeek')).toBe('2026-10-16');
  });

  it('las flechas cruzan de mes', () => {
    expect(getDateInDirection('2026-10-01', 'previousDay')).toBe('2026-09-30');
    expect(getDateInDirection('2026-10-28', 'nextWeek')).toBe('2026-11-04');
  });

  it('Inicio y Fin van a los extremos de la semana, que empieza en lunes', () => {
    expect(getDateInDirection(FRIDAY, 'weekStart')).toBe('2026-10-05');
    expect(getDateInDirection(FRIDAY, 'weekEnd')).toBe('2026-10-11');
    // Desde un extremo, no se mueve.
    expect(getDateInDirection('2026-10-05', 'weekStart')).toBe('2026-10-05');
    expect(getDateInDirection('2026-10-11', 'weekEnd')).toBe('2026-10-11');
  });

  it('con la semana en domingo, los extremos cambian', () => {
    expect(getDateInDirection(FRIDAY, 'weekStart', 0)).toBe('2026-10-04');
    expect(getDateInDirection(FRIDAY, 'weekEnd', 0)).toBe('2026-10-10');
    expect(getDateInDirection('2026-10-11', 'weekStart', 0)).toBe('2026-10-11');
  });

  it('RePág y AvPág cambian de mes; con Mayúsculas, de año', () => {
    expect(getDateInDirection(FRIDAY, 'previousMonth')).toBe('2026-09-09');
    expect(getDateInDirection(FRIDAY, 'nextMonth')).toBe('2026-11-09');
    expect(getDateInDirection(FRIDAY, 'previousYear')).toBe('2025-10-09');
    expect(getDateInDirection(FRIDAY, 'nextYear')).toBe('2027-10-09');
  });

  it('al cambiar de mes o de año se queda en el último día si el destino es más corto', () => {
    expect(getDateInDirection('2026-01-31', 'nextMonth')).toBe('2026-02-28');
    expect(getDateInDirection('2028-02-29', 'nextYear')).toBe('2029-02-28');
  });

  it('todas las direcciones del contrato llevan a una fecha', () => {
    for (const direction of calendarDirections) {
      expect(getDateInDirection(FRIDAY, direction)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
