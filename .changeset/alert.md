---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Alert`, un mensaje dentro de la página que no desaparece solo. Entra con madurez `experimental`.

- `tone` (`success`, `warning`, `danger`, `info`) fija el color y el icono. `danger` y `warning` interrumpen al lector de pantalla; `success` e `info` esperan a que termine de leer.
- `title` y una descripción como `children`, que admite contenido propio, por ejemplo un enlace.
- Con `onClose` muestra un botón de cierre; su nombre accesible lo pone la app con `closeLabel`, obligatorio en ese caso.
- `core` publica el contrato `AlertProps`.
