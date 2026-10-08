// API pública de @satellatickets/ui. Una sola importación para web y nativo:
// el bundler de cada plataforma resuelve la vista correcta (ADR-001, ADR-004).
export { useBrand, useColorScheme, useTheme } from '@satellatickets/core';
export type { ColorScheme, ThemeMode } from '@satellatickets/core';
export * from './alert';
export * from './badge';
export * from './box';
export * from './button';
export * from './card';
export * from './checkbox';
export * from './divider';
export * from './form-field';
export * from './icon';
export * from './icon-button';
export * from './input';
export * from './link';
export * from './modal';
export * from './select';
export * from './sheet';
export * from './skeleton';
export * from './spinner';
export * from './stack';
export * from './switch';
export * from './tabs';
export * from './text';
export * from './text-area';
export * from './toast';
export * from './ui-provider';
