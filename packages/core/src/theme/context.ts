import { createContext, useContext } from 'react';
import type { BrandName, Theme } from '@satellatickets/tokens';

import type { ColorScheme, ThemeMode } from '../types/ui-provider';
import { resolveColorScheme, resolveTheme } from './resolve-theme';

export interface UIContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  mode: ThemeMode;
  brand: BrandName | undefined;
}

export function createUIContextValue(
  mode: ThemeMode,
  systemScheme: ColorScheme,
  brand?: BrandName,
): UIContextValue {
  const colorScheme = resolveColorScheme(mode, systemScheme);
  return { theme: resolveTheme(colorScheme, brand), colorScheme, mode, brand };
}

/** Sin `UIProvider` se usa el tema claro por defecto, para que los componentes funcionen aislados. */
export const UIContext = createContext<UIContextValue>(createUIContextValue('light', 'light'));

export function useUIContext(): UIContextValue {
  return useContext(UIContext);
}

/** Tema resuelto (tokens con la marca aplicada). Imprescindible en las vistas nativas (ADR-008). */
export function useTheme(): Theme {
  return useContext(UIContext).theme;
}

/** `'light' | 'dark'` ya resuelto, también con `theme="system"`. */
export function useColorScheme(): ColorScheme {
  return useContext(UIContext).colorScheme;
}

export function useBrand(): BrandName | undefined {
  return useContext(UIContext).brand;
}
