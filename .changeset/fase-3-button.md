---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Button`, el componente de referencia (Fase 3 del ROADMAP), y un `Spinner` mínimo. Ambos entran con madurez `experimental`.

- `Button`: variantes `primary`, `secondary`, `ghost` y `danger`; tamaños `sm`, `md` y `lg`; `iconStart` e `iconEnd`; `fullWidth`; `disabled` y `loading`. Mientras carga no dispara `onPress`, pero conserva el foco, el nombre accesible y la anchura. En web es un `<button>` (`type="button"` por defecto) con hover, pulsado y anillo de foco en CSS; en nativo, un `Pressable` con su estado de accesibilidad y un área táctil mínima de 44 puntos.
- `Spinner`: indicador de carga con la escala de tamaños de `Icon`; con `label` se anuncia como progreso indeterminado.
- `core` publica los contratos `ButtonProps` y `SpinnerProps`, las constantes `buttonVariants`, `buttonIconSize` y `spinnerSizes`, y el hook `useButton`.
- Corrección en web: un `Box` o un `Stack` anidado ya no hereda el relleno, el fondo, el borde, el radio, la sombra ni la separación del que lo contiene.
