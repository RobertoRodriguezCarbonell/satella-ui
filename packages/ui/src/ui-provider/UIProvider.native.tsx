import {
  createUIContextValue,
  ToastContext,
  UIContext,
  type UIProviderProps,
} from '@satellatickets/core';
import { useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { ToastViewport } from '../toast/ToastViewport';
import { useToastHost } from '../toast/useToastHost';

/**
 * Activa tema y marca para todo lo que envuelve (ADR-010). Entrega el tema
 * resuelto por contexto; `system` sigue a `Appearance`. También guarda la cola de
 * toasts y los pinta sobre la vista que lo contiene (ADR-039).
 */
export function UIProvider({ theme = 'system', brand, children }: UIProviderProps) {
  const system = useSystemColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo(() => createUIContextValue(theme, system, brand), [theme, system, brand]);
  const toasts = useToastHost();
  return (
    <UIContext.Provider value={value}>
      <ToastContext.Provider value={toasts.store}>
        {children}
        {toasts.own === null ? null : <ToastViewport store={toasts.own} />}
      </ToastContext.Provider>
    </UIContext.Provider>
  );
}
