import {
  createUIContextValue,
  UIContext,
  type ColorScheme,
  type UIProviderProps,
} from '@satellatickets/core';
import { useMemo, useSyncExternalStore } from 'react';

import './UIProvider.css';
import styles from './UIProvider.module.css';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot(): ColorScheme {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function getServerSnapshot(): ColorScheme {
  return 'light';
}

/** Esquema preferido por el sistema (`prefers-color-scheme`), estable en SSR. */
export function useSystemColorScheme(): ColorScheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Activa tema y marca para todo lo que envuelve (ADR-010). Pone `data-theme` y
 * `data-brand` en un contenedor sin caja propia; `tokens.css` hace el resto.
 */
export function UIProvider({ theme = 'system', brand, children }: UIProviderProps) {
  const system = useSystemColorScheme();
  const value = useMemo(() => createUIContextValue(theme, system, brand), [theme, system, brand]);
  return (
    <UIContext.Provider value={value}>
      <div className={styles.root} data-theme={value.colorScheme} data-brand={brand}>
        {children}
      </div>
    </UIContext.Provider>
  );
}
