import { describe, expect, it } from 'vitest';

import { firstEnabledTab, getTabInDirection, tabDirections } from './navigation';

const TABS = [
  { value: 'a' },
  { value: 'b', disabled: true },
  { value: 'c' },
  { value: 'd' },
] as const;

describe('firstEnabledTab', () => {
  it('devuelve la primera pestaña habilitada', () => {
    expect(firstEnabledTab(TABS)).toBe('a');
    expect(firstEnabledTab([{ value: 'x', disabled: true }, { value: 'y' }])).toBe('y');
  });

  it('sin pestañas habilitadas devuelve undefined', () => {
    expect(firstEnabledTab([])).toBeUndefined();
    expect(firstEnabledTab([{ value: 'x', disabled: true }])).toBeUndefined();
  });
});

describe('getTabInDirection', () => {
  it('next y previous saltan las deshabilitadas', () => {
    expect(getTabInDirection(TABS, 'a', 'next')).toBe('c');
    expect(getTabInDirection(TABS, 'c', 'previous')).toBe('a');
  });

  it('next y previous dan la vuelta al llegar al final', () => {
    expect(getTabInDirection(TABS, 'd', 'next')).toBe('a');
    expect(getTabInDirection(TABS, 'a', 'previous')).toBe('d');
  });

  it('first y last van a los extremos habilitados', () => {
    expect(getTabInDirection(TABS, 'c', 'first')).toBe('a');
    expect(getTabInDirection(TABS, 'a', 'last')).toBe('d');
    expect(
      getTabInDirection(
        [{ value: 'x', disabled: true }, { value: 'y' }, { value: 'z' }],
        'z',
        'first',
      ),
    ).toBe('y');
  });

  it('desde una pestaña deshabilitada o desconocida entra por el extremo que toca', () => {
    expect(getTabInDirection(TABS, 'b', 'next')).toBe('a');
    expect(getTabInDirection(TABS, 'b', 'previous')).toBe('d');
    expect(getTabInDirection(TABS, 'no-existe', 'next')).toBe('a');
  });

  it('sin otra pestaña a la que ir devuelve la actual', () => {
    expect(getTabInDirection([{ value: 'a' }], 'a', 'next')).toBe('a');
    for (const direction of tabDirections) {
      expect(getTabInDirection([{ value: 'a', disabled: true }], 'a', direction)).toBe('a');
      expect(getTabInDirection([], 'a', direction)).toBe('a');
    }
  });
});
