---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Modal` y `Sheet`: un diálogo que interrumpe lo que hay debajo (ADR-040). `Modal` se centra y `Sheet` se ancla al borde inferior; comparten contrato. Entran con madurez `experimental`.

- Controlados: `open` lo decide la app y el diálogo pide cerrarse con `onClose`. El contenido solo se monta mientras está abierto.
- `title` es obligatorio y es su nombre accesible; `description`, `footer` y el contenido son opcionales. El botón de cierre aparece si la app pasa `closeLabel`.
- Con `dismissible={false}`, ni Escape, ni pulsar fuera, ni el botón atrás de Android lo cierran.
- En web es un `<dialog>` real abierto con `showModal()`: el navegador atrapa el foco, deja inerte el resto de la página y lo pinta por encima de todo. En nativo es el `Modal` de React Native.
- `core` publica los contratos `ModalProps` y `SheetProps` y la constante `modalPresentations`.
