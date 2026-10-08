---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Checkbox`, una opción que se marca o no, con su etiqueta como `children`. Entra con madurez `experimental`.

- Controlada con `checked` o no controlada con `defaultChecked`; avisa con `onCheckedChange(marcada)`. `indeterminate` la pinta como parcialmente marcada.
- Estados `disabled` e `invalid`. Sin etiqueta visible necesita `accessibilityLabel`.
- En web es un `<input type="checkbox">` real y viaja en un `<form>` con `name` y `value`. En nativo amplía su área táctil hasta 44 puntos.
- `core` publica el contrato `CheckboxProps` y el hook `useControllableState`.
