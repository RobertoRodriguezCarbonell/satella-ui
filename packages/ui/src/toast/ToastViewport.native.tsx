import { useTheme, type ToastStore } from '@satellatickets/core';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { useLeaving } from '../_internal/useLeaving';
import { Toast } from './Toast';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  // Pegada al borde inferior de la vista que contiene al `UIProvider`, que es la raíz de la app.
  viewport: { position: 'absolute', right: 0, bottom: 0, left: 0, alignItems: 'center' },
});

/**
 * La zona donde aparecen los toasts de un `UIProvider` (ADR-039). No recibe toques:
 * solo las tarjetas.
 */
export function ToastViewport({ store }: { store: ToastStore }) {
  const t = useTheme();
  const toasts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  // Un toast cerrado sigue en pantalla lo que dura su salida.
  const [items, remove] = useLeaving(toasts);
  const announced = useRef(new Set<string>());

  // Cada toast se anuncia una vez al llegar, en iOS y en Android.
  useEffect(() => {
    const visible = new Set(toasts.map((toast) => toast.id));
    for (const toast of toasts) {
      if (announced.current.has(toast.id)) continue;
      announced.current.add(toast.id);
      AccessibilityInfo.announceForAccessibility(
        toast.description === undefined ? toast.title : `${toast.title}. ${toast.description}`,
      );
    }
    for (const id of announced.current) {
      if (!visible.has(id)) announced.current.delete(id);
    }
  }, [toasts]);

  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.viewport,
        {
          zIndex: t.zIndex.toast,
          gap: t.space[2],
          padding: t.space[4],
          // La librería no conoce la zona segura del dispositivo (ADR-039): deja un
          // margen fijo que salva la barra de inicio de un iPhone.
          paddingBottom: t.space[10],
        },
      ]}
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
    </View>
  );
}
