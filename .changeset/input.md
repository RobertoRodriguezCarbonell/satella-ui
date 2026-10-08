---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Input`, un campo de texto de una línea. Entra con madurez `experimental`.

- `type` (`text`, `email`, `password`, `search`, `tel`, `url`, `number`) elige el teclado y el autocompletado de cada plataforma. `number` es un campo de texto con teclado numérico, no un `type="number"`.
- Tamaños `sm`, `md` y `lg`, con las mismas alturas que `Button`. Estados `disabled`, `readOnly` e `invalid`, e iconos decorativos con `iconStart` e `iconEnd`.
- Controlado con `value` o no controlado con `defaultValue`; avisa con `onChangeText(texto)`. `onSubmit` se llama con Intro o con la tecla de envío del teclado.
- En web el foco se dibuja en toda la caja, y pulsar el borde o un icono enfoca el campo. Acepta `name` y `autoComplete`.
- `core` publica el contrato `InputProps` y las constantes `inputTypes`, `inputIconSize` y `controlSizes`.
