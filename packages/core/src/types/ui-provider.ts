import type { ReactNode } from 'react';
import type { BrandName, ThemeName } from '@satellatickets/tokens';

/** Modo de tema que acepta `UIProvider` (ADR-010). */
export const themeModes = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof themeModes)[number];

/** Esquema resuelto: siempre uno de los temas definidos en tokens. */
export type ColorScheme = ThemeName;

export interface UIProviderProps {
  /** Tema claro, oscuro o el del sistema (por defecto `system`). */
  theme?: ThemeMode | undefined;
  /** Marca registrada en tokens. Sin marca se usa la identidad por defecto. */
  brand?: BrandName | undefined;
  children: ReactNode;
}
