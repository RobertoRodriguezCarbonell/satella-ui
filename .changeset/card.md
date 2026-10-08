---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Card`, una superficie que agrupa contenido relacionado. Entra con madurez `experimental`.

- Variantes `outlined` y `elevated`, que añade sombra. `padding` acepta un espacio de los tokens; con `0`, el contenido llega hasta el borde y la tarjeta lo recorta a su radio.
- Con `onPress`, toda la tarjeta es un botón: se pulsa con ratón, teclado o toque, y su nombre accesible es su contenido. En ese caso no debe contener otros controles.
- `core` publica el contrato `CardProps` y la constante `cardVariants`.
