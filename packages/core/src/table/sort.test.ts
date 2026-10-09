import { describe, expect, it } from 'vitest';

import { getNextSort } from './sort';

describe('getNextSort', () => {
  it('sin orden previo, ordena por la columna en ascendente', () => {
    expect(getNextSort(null, 'total')).toEqual({ column: 'total', direction: 'ascending' });
    expect(getNextSort(undefined, 'total')).toEqual({ column: 'total', direction: 'ascending' });
  });

  it('sobre la misma columna invierte el sentido cada vez', () => {
    const first = getNextSort(null, 'total');
    const second = getNextSort(first, 'total');
    expect(second).toEqual({ column: 'total', direction: 'descending' });
    expect(getNextSort(second, 'total')).toEqual({ column: 'total', direction: 'ascending' });
  });

  it('al cambiar de columna empieza en ascendente', () => {
    expect(getNextSort({ column: 'total', direction: 'ascending' }, 'fecha')).toEqual({
      column: 'fecha',
      direction: 'ascending',
    });
    expect(getNextSort({ column: 'total', direction: 'descending' }, 'fecha')).toEqual({
      column: 'fecha',
      direction: 'ascending',
    });
  });

  it('no modifica el orden que recibe', () => {
    const current = { column: 'total', direction: 'ascending' } as const;
    getNextSort(current, 'total');
    expect(current).toEqual({ column: 'total', direction: 'ascending' });
  });
});
