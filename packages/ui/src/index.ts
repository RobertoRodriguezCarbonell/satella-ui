// API pública de @satellatickets/ui. Una sola importación para web y nativo:
// el bundler de cada plataforma resuelve la vista correcta (ADR-001, ADR-004).
export { useBrand, useColorScheme, useTheme } from '@satellatickets/core';
export type { ColorScheme, ThemeMode } from '@satellatickets/core';
export * from './badge';
export * from './box';
export * from './button';
export * from './icon';
export * from './spinner';
export * from './stack';
export * from './text';
export * from './ui-provider';
