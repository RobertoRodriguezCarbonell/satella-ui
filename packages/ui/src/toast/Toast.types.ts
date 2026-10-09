import type { ToastItem } from '@satellatickets/core';

export type { ToastAction, ToastApi, ToastOptions } from '@satellatickets/core';

/** Props de la tarjeta de un toast. Es interna: los toasts se muestran con `useToast` (ADR-039). */
export interface ToastCardProps {
  toast: ToastItem;
  /** Cierra este toast: lo llaman el botón de cierre y la acción. */
  onDismiss: () => void;
  /** Ya se ha cerrado y solo queda su animación de salida: no se anuncia ni se puede pulsar. */
  leaving?: boolean | undefined;
  /** La salida ha terminado: ya se puede dejar de pintar. */
  onExited?: (() => void) | undefined;
}
