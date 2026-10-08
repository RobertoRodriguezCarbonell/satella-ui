---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Select`, para elegir una opción de una lista. Entra con madurez `experimental`.

- `options` es una lista de `{ value, label, disabled? }`. Controlado con `value` o no controlado con `defaultValue`; avisa con `onValueChange(value)`. `placeholder` se muestra mientras no hay opción elegida.
- Tamaños `sm`, `md` y `lg`, y estados `disabled` e `invalid`, como `Input`.
- En web es un `<select>` real: el teclado, los lectores de pantalla y el selector del sistema en móvil son los del navegador. En nativo es un disparador que abre una lista modal propia, sin dependencias nuevas (ADR-038).
- `core` publica los contratos `SelectProps` y `SelectOption`.
