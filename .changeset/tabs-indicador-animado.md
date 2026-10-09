---
'@satellatickets/ui': minor
---

El indicador de `Tabs` se desliza de una pestaña a otra. Antes se apagaba bajo una y se encendía bajo la otra; ahora es una sola barra que se desplaza y cambia de ancho hasta la pestaña elegida, con el ratón, con el toque y con las flechas del teclado. Dura lo que marca el token `duration.normal` (250 ms).

- Al cargar aparece ya en su sitio, y si las pestañas cambian de tamaño (llega la fuente, se estrecha la página) las sigue sin deslizarse.
- Con movimiento reducido en los ajustes del sistema, cambia de sitio sin animación.
- En web, la lista de pestañas lleva dentro un `<span aria-hidden="true">` nuevo, que es la barra. En el servidor, o sin JavaScript, el indicador sigue siendo el borde de la pestaña elegida.
