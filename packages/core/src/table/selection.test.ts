import { describe, expect, it } from 'vitest';

import {
  getSelectionState,
  selectionStates,
  toggleAllSelected,
  toggleSelectedKey,
} from './selection';

const PAGE = ['a', 'b', 'c'] as const;

describe('getSelectionState', () => {
  it('distingue ninguna, algunas y todas', () => {
    expect(getSelectionState(PAGE, [])).toBe('none');
    expect(getSelectionState(PAGE, ['b'])).toBe('some');
    expect(getSelectionState(PAGE, ['c', 'a', 'b'])).toBe('all');
  });

  it('las claves de otras páginas no cuentan', () => {
    expect(getSelectionState(PAGE, ['x', 'y'])).toBe('none');
    expect(getSelectionState(PAGE, ['x', 'a'])).toBe('some');
    expect(getSelectionState(PAGE, ['x', 'a', 'b', 'c'])).toBe('all');
  });

  it('sin filas no hay nada elegido', () => {
    expect(getSelectionState([], [])).toBe('none');
    expect(getSelectionState([], ['x'])).toBe('none');
  });

  it('solo devuelve estados del contrato', () => {
    expect(selectionStates).toContain(getSelectionState(PAGE, ['a']));
  });
});

describe('toggleSelectedKey', () => {
  it('añade al final la que no estaba', () => {
    expect(toggleSelectedKey(['a'], 'c')).toEqual(['a', 'c']);
  });

  it('quita la que estaba y conserva el orden del resto', () => {
    expect(toggleSelectedKey(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });

  it('no modifica la lista que recibe', () => {
    const selected = ['a'] as const;
    toggleSelectedKey(selected, 'b');
    expect(selected).toEqual(['a']);
  });
});

describe('toggleAllSelected', () => {
  it('marca las que faltan', () => {
    expect(toggleAllSelected(PAGE, [])).toEqual(['a', 'b', 'c']);
    expect(toggleAllSelected(PAGE, ['b'])).toEqual(['b', 'a', 'c']);
  });

  it('si ya están todas, las desmarca', () => {
    expect(toggleAllSelected(PAGE, ['a', 'b', 'c'])).toEqual([]);
  });

  it('no toca las claves de otras páginas', () => {
    expect(toggleAllSelected(PAGE, ['x'])).toEqual(['x', 'a', 'b', 'c']);
    expect(toggleAllSelected(PAGE, ['x', 'a', 'b', 'c', 'y'])).toEqual(['x', 'y']);
  });

  it('sin filas no cambia nada', () => {
    expect(toggleAllSelected([], ['x'])).toEqual(['x']);
  });
});
