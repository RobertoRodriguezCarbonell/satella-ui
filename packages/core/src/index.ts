// API pública de @satellatickets/core: contratos, constantes de variantes y hooks headless (ADR-009).
//
// Los contextos y los hooks viven en `client.ts`, que en el build lleva "use client"
// (ADR-041). Todo lo demás es código puro y se puede usar también desde un Server Component.
export * from './client';
export * from './select';
export * from './tabs';
export { mergeTheme, resolveColorScheme, resolveTheme } from './theme/resolve-theme';
export {
  createToastStore,
  TOAST_DEFAULT_DURATION,
  TOAST_MAX_VISIBLE,
  type ToastStore,
} from './toast/store';
export * from './types/alert';
export * from './types/badge';
export * from './types/box';
export * from './types/button';
export * from './types/card';
export * from './types/checkbox';
export * from './types/control';
export * from './types/divider';
export * from './types/feedback';
export * from './types/form-field';
export * from './types/icon';
export * from './types/icon-button';
export * from './types/input';
export * from './types/link';
export * from './types/modal';
export * from './types/select';
export * from './types/skeleton';
export * from './types/spinner';
export * from './types/stack';
export * from './types/switch';
export * from './types/tabs';
export * from './types/text';
export * from './types/text-area';
export * from './types/toast';
export * from './types/ui-provider';
