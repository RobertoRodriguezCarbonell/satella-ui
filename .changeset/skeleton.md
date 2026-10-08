---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Skeleton`, el hueco de un contenido que todavía se está cargando. Entra con madurez `experimental`.

- Formas `text`, `rectangle` y `circle`. En `text`, cada línea ocupa lo mismo que una línea de `Text` de la `variant` indicada, así que nada se mueve al llegar el contenido; `lines` pinta varias, con la última más corta.
- `width` admite puntos o un porcentaje del contenedor, y `height`, puntos.
- Late entre dos fondos del tema y se queda quieto con movimiento reducido. Es decorativo: los lectores de pantalla lo ignoran.
- `core` publica el contrato `SkeletonProps` y la constante `skeletonShapes`.
