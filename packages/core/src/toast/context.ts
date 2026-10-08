import { createContext, useContext } from 'react';

import type { ToastApi } from '../types/toast';
import type { ToastStore } from './store';

/** La cola de toasts del `UIProvider` más cercano; `null` fuera de uno. */
export const ToastContext = createContext<ToastStore | null>(null);

/**
 * Muestra y cierra toasts (ADR-039). Necesita un `UIProvider` por encima: es él quien
 * guarda la cola y los pinta.
 */
export function useToast(): ToastApi {
  const store = useContext(ToastContext);
  if (store === null) {
    throw new Error('useToast necesita un <UIProvider> por encima: es él quien pinta los toasts.');
  }
  return store;
}
