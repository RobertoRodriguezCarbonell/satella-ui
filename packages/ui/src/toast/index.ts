// Los toasts se muestran con `useToast`; no hay componente que colocar: `UIProvider`
// guarda la cola y los pinta (ADR-039).
export { useToast } from '@satellatickets/core';
export type { ToastAction, ToastApi, ToastOptions } from './Toast.types';
