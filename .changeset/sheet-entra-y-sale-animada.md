---
'@satellatickets/ui': minor
---

`Sheet` entra y sale con una animación: la hoja sube desde el borde inferior mientras el fondo se oscurece entero, y al cerrarse baja mientras el fondo se aclara. Dura lo que marca el token `duration.normal` (250 ms).

- En web aparecía y desaparecía de golpe.
- En nativo se deslizaba la ventana completa, con el fondo dentro, y se veía subir el borde del oscurecido. Ahora el fondo aparece a la vez en toda la pantalla.
- Con movimiento reducido en los ajustes del sistema, aparece y desaparece sin animación.

Al cerrarse, la hoja y su contenido siguen en pantalla mientras dura la salida, sin poder pulsarse. Un test que compruebe que ha desaparecido nada más cerrarla tiene que esperar a que termine (`waitFor`). `Modal` no cambia.
