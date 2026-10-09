// Lo que necesita React en el cliente: los contextos y los hooks (ADR-041). En el build
// es un fichero aparte, `dist/client.js`, que lleva la directiva "use client": así un
// Server Component puede importar de `@satellatickets/core` las constantes y las
// funciones puras sin evaluar `createContext`, que en el servidor no existe.
//
// Lo que se añada aquí deja de poder usarse desde un Server Component. Lo que no use
// hooks ni contextos va en `index.ts`.
export * from './form-field/context';
export * from './hooks/use-button';
export * from './hooks/use-calendar';
export * from './hooks/use-controllable-state';
export * from './hooks/use-link';
export {
  createUIContextValue,
  UIContext,
  useBrand,
  useColorScheme,
  useTheme,
  useUIContext,
  type UIContextValue,
} from './theme/context';
export { ToastContext, useToast } from './toast/context';
