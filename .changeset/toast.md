---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

Toasts: avisos breves que aparecen sobre la interfaz y desaparecen solos (ADR-039). Entran con madurez `experimental`.

- Se lanzan con `useToast()`: `show({ tone, title, description, duration, action, closeLabel })` devuelve el `id` del aviso y `dismiss(id)` lo cierra. No hay componente que colocar.
- `UIProvider` guarda la cola y pinta los avisos pegados al borde inferior. Uno anidado reutiliza la zona del de fuera.
- Se cierran a los 5 segundos por defecto; con `duration: 0`, cuando alguien los cierre. Como mucho hay tres a la vez. En web el cierre se pausa mientras el puntero o el foco están sobre ellos.
- `danger` y `warning` interrumpen al lector de pantalla; `success` e `info` esperan. En nativo se anuncian con `AccessibilityInfo`.
- `core` publica `createToastStore`, `ToastContext`, `useToast`, las constantes `TOAST_DEFAULT_DURATION` y `TOAST_MAX_VISIBLE`, y los tipos `ToastOptions`, `ToastAction`, `ToastItem` y `ToastApi`.
