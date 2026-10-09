import { describe, expect, it } from 'vitest';

import { EMPTY_RANGE, getNextRange, isDateInRange, isRangeComplete } from './range';

describe('getNextRange', () => {
  it('la primera fecha fija el inicio', () => {
    expect(getNextRange(EMPTY_RANGE, '2026-10-09')).toEqual({ start: '2026-10-09', end: '' });
  });

  it('la segunda cierra el periodo', () => {
    expect(getNextRange({ start: '2026-10-09', end: '' }, '2026-10-12')).toEqual({
      start: '2026-10-09',
      end: '2026-10-12',
    });
  });

  it('si la segunda es anterior, las ordena', () => {
    expect(getNextRange({ start: '2026-10-09', end: '' }, '2026-10-02')).toEqual({
      start: '2026-10-02',
      end: '2026-10-09',
    });
  });

  it('la misma fecha dos veces es un periodo de un día', () => {
    expect(getNextRange({ start: '2026-10-09', end: '' }, '2026-10-09')).toEqual({
      start: '2026-10-09',
      end: '2026-10-09',
    });
  });

  it('con el periodo completo, la siguiente empieza uno nuevo', () => {
    expect(getNextRange({ start: '2026-10-09', end: '2026-10-12' }, '2026-10-20')).toEqual({
      start: '2026-10-20',
      end: '',
    });
  });

  it('no modifica el periodo que recibe', () => {
    const current = { start: '2026-10-09', end: '' };
    getNextRange(current, '2026-10-12');
    expect(current).toEqual({ start: '2026-10-09', end: '' });
    expect(EMPTY_RANGE).toEqual({ start: '', end: '' });
  });
});

describe('isRangeComplete e isDateInRange', () => {
  it('un periodo está completo con sus dos fechas', () => {
    expect(isRangeComplete(EMPTY_RANGE)).toBe(false);
    expect(isRangeComplete({ start: '2026-10-09', end: '' })).toBe(false);
    expect(isRangeComplete({ start: '2026-10-09', end: '2026-10-12' })).toBe(true);
  });

  it('contiene sus extremos y lo que hay entre ellos', () => {
    const range = { start: '2026-10-09', end: '2026-10-12' };
    expect(isDateInRange('2026-10-09', range)).toBe(true);
    expect(isDateInRange('2026-10-10', range)).toBe(true);
    expect(isDateInRange('2026-10-12', range)).toBe(true);
    expect(isDateInRange('2026-10-08', range)).toBe(false);
    expect(isDateInRange('2026-10-13', range)).toBe(false);
  });

  it('un periodo a medias no contiene nada', () => {
    expect(isDateInRange('2026-10-09', { start: '2026-10-09', end: '' })).toBe(false);
    expect(isDateInRange('2026-10-09', EMPTY_RANGE)).toBe(false);
  });
});
