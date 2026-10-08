import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { LinkPressEvent } from '../types/link';
import { useLink } from './use-link';

describe('useLink', () => {
  it('sin onPress, la navegación por defecto sigue', () => {
    const { result } = renderHook(() => useLink({}));
    expect(result.current.press()).toBe(true);
  });

  it('llama a onPress y deja seguir la navegación si nadie la cancela', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useLink({ onPress }));
    expect(result.current.press()).toBe(true);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('preventDefault cancela la navegación por defecto', () => {
    const onPress = vi.fn((event: LinkPressEvent) => event.preventDefault());
    const { result } = renderHook(() => useLink({ onPress }));
    expect(result.current.press()).toBe(false);
  });

  it('defaultPrevented refleja si se ha cancelado', () => {
    const seen: boolean[] = [];
    const onPress = (event: LinkPressEvent) => {
      seen.push(event.defaultPrevented);
      event.preventDefault();
      seen.push(event.defaultPrevented);
    };
    const { result } = renderHook(() => useLink({ onPress }));
    result.current.press();
    expect(seen).toEqual([false, true]);
  });

  it('cada pulsación empieza sin cancelar', () => {
    let cancel = true;
    const onPress = (event: LinkPressEvent) => {
      if (cancel) event.preventDefault();
    };
    const { result } = renderHook(() => useLink({ onPress }));
    expect(result.current.press()).toBe(false);
    cancel = false;
    expect(result.current.press()).toBe(true);
  });

  it('mantiene la identidad de press mientras no cambie onPress', () => {
    const first = vi.fn();
    const { result, rerender } = renderHook(
      ({ onPress }: { onPress: () => void }) => useLink({ onPress }),
      { initialProps: { onPress: first } },
    );
    const press = result.current.press;
    rerender({ onPress: first });
    expect(result.current.press).toBe(press);
    rerender({ onPress: vi.fn() });
    expect(result.current.press).not.toBe(press);
  });
});
