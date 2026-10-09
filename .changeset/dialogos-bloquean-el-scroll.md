---
'@satellatickets/ui': minor
---

En web, la página de detrás ya no se desplaza mientras hay un `Modal` o un `Sheet` abierto (ADR-044). Antes la rueda del ratón y el dedo seguían moviéndola. Si la barra de desplazamiento ocupa sitio, se compensa su ancho para que nada salte al abrir ni al cerrar.

Mientras el diálogo está en pantalla, la librería pone `overflow: hidden` en el elemento raíz del documento y lo restaura al cerrarse el último.
