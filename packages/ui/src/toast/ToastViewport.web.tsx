import type { ToastStore } from '@satellatickets/core';
import { useSyncExternalStore } from 'react';

import { useLeaving } from '../_internal/useLeaving';
import { Toast } from './Toast';
import styles from './Toast.module.css';

/**
 * La zona donde aparecen los toasts de un `UIProvider` (ADR-039). Existe siempre,
 * aunque esté vacía: así los lectores de pantalla anuncian cada toast al llegar.
 */
export function ToastViewport({ store }: { store: ToastStore }) {
  const toasts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  // Un toast cerrado sigue en pantalla lo que dura su salida.
  const [items, remove] = useLeaving(toasts);
  return (
    // La zona no es un control: solo detiene el cierre automático mientras el puntero o
    // el foco están sobre los toasts, para dar tiempo a leerlos y a pulsar sus botones.
    <div
      className={styles.viewport}
      aria-live="polite"
      onMouseEnter={store.pause}
      onMouseLeave={store.resume}
      onFocus={store.pause}
      onBlur={store.resume}
    >
      {items.map(({ item, leaving }) => (
        <Toast
          key={item.id}
          toast={item}
          leaving={leaving}
          onDismiss={() => store.dismiss(item.id)}
          onExited={() => remove(item.id)}
        />
      ))}
    </div>
  );
}
