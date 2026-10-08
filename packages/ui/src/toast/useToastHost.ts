import { createToastStore, ToastContext, type ToastStore } from '@satellatickets/core';
import { useContext, useEffect, useState } from 'react';

export interface ToastHost {
  /** La cola que usa este árbol: la del `UIProvider` de fuera, si lo hay, o una propia. */
  store: ToastStore;
  /** La cola propia; `null` si se reutiliza la de fuera. Solo quien la crea pinta los toasts. */
  own: ToastStore | null;
}

/**
 * La cola de toasts de un `UIProvider` (ADR-039). Uno anidado, por ejemplo para cambiar
 * de marca en una sección, reutiliza la del de fuera: solo hay una zona de avisos por app.
 */
export function useToastHost(): ToastHost {
  const outer = useContext(ToastContext);
  const [own] = useState(() => (outer === null ? createToastStore() : null));

  // Al desmontar no quedan temporizadores vivos.
  useEffect(() => () => own?.dismiss(), [own]);

  return { store: outer ?? own ?? createToastStore(), own: outer === null ? own : null };
}
