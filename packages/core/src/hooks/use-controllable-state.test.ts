import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  it('sin value guarda su propio estado a partir de defaultValue', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }));
    expect(result.current[0]).toBe('a');

    act(() => result.current[1]('b'));

    expect(result.current[0]).toBe('b');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('con value manda la app: avisa del cambio pero no cambia hasta recibir el valor nuevo', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useControllableState({ value, defaultValue: '', onChange }),
      { initialProps: { value: 'a' } },
    );

    act(() => result.current[1]('b'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('b');
    expect(result.current[0]).toBe('a');

    rerender({ value: 'b' });
    expect(result.current[0]).toBe('b');
  });

  it('no avisa si el valor no cambia', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: true, onChange }));

    act(() => result.current[1](true));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('funciona sin onChange', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 1 }));

    act(() => result.current[1](2));

    expect(result.current[0]).toBe(2);
  });

  it('un value falso pero definido sigue siendo controlado', () => {
    const { result } = renderHook(() => useControllableState({ value: false, defaultValue: true }));

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(false);
  });
});
