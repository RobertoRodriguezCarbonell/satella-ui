---
'@satellatickets/tokens': minor
---

Tokens de curva de animación (ADR-043): `easing.enter` para lo que aparece, `easing.exit` para lo que se va y `easing.move` para lo que cambia de sitio. En web son las variables `--easing-enter`, `--easing-exit` y `--easing-move`, listas para usar en `transition` y `animation`. En React Native, `theme.easing.enter` son los cuatro números de la curva, para `Easing.bezier(...theme.easing.enter)`.

El pipeline admite el tipo `cubicBezier` de DTCG, y los tipos exportan `CubicBezier`.
