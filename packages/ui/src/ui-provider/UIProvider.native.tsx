import { createUIContextValue, UIContext, type UIProviderProps } from '@satellatickets/core';
import { useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

/**
 * Activa tema y marca para todo lo que envuelve (ADR-010). Entrega el tema
 * resuelto por contexto; `system` sigue a `Appearance`.
 */
export function UIProvider({ theme = 'system', brand, children }: UIProviderProps) {
  const system = useSystemColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo(() => createUIContextValue(theme, system, brand), [theme, system, brand]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
