import { renderHook } from '@testing-library/react';
import { themes } from '@satellatickets/tokens';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createUIContextValue, UIContext, useBrand, useColorScheme, useTheme } from './context';

function withContext(
  mode: 'light' | 'dark' | 'system',
  system: 'light' | 'dark',
  brand?: 'admin' | 'organizer',
) {
  const value = createUIContextValue(mode, system, brand);
  return ({ children }: { children: ReactNode }) =>
    createElement(UIContext.Provider, { value }, children);
}

describe('hooks de tema', () => {
  it('sin provider devuelven el tema claro', () => {
    expect(renderHook(() => useTheme()).result.current).toBe(themes.light);
    expect(renderHook(() => useColorScheme()).result.current).toBe('light');
    expect(renderHook(() => useBrand()).result.current).toBeUndefined();
  });

  it('resuelven system con el esquema del sistema', () => {
    const { result } = renderHook(() => useColorScheme(), {
      wrapper: withContext('system', 'dark'),
    });
    expect(result.current).toBe('dark');
  });

  it('entregan el tema con la marca aplicada', () => {
    const { result } = renderHook(() => ({ theme: useTheme(), brand: useBrand() }), {
      wrapper: withContext('dark', 'light', 'organizer'),
    });
    expect(result.current.brand).toBe('organizer');
    expect(result.current.theme.color.action.primary).toBe('#f9791f');
  });
});
