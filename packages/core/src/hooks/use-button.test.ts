import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useButton } from './use-button';

describe('useButton', () => {
  it('por defecto es interactivo y dispara onPress', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ onPress }));
    expect(result.current).toMatchObject({ disabled: false, loading: false, interactive: true });
    result.current.press();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('deshabilitado no dispara onPress', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ disabled: true, onPress }));
    expect(result.current.interactive).toBe(false);
    result.current.press();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('cargando no dispara onPress', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ loading: true, onPress }));
    expect(result.current).toMatchObject({ loading: true, interactive: false });
    result.current.press();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('funciona sin onPress', () => {
    const { result } = renderHook(() => useButton({}));
    expect(() => result.current.press()).not.toThrow();
  });

  it('mantiene la identidad de press mientras no cambien sus entradas', () => {
    const onPress = vi.fn();
    const { result, rerender } = renderHook(
      ({ loading }: { loading: boolean }) => useButton({ loading, onPress }),
      { initialProps: { loading: false } },
    );
    const first = result.current.press;
    rerender({ loading: false });
    expect(result.current.press).toBe(first);
    rerender({ loading: true });
    expect(result.current.press).not.toBe(first);
  });
});
