---
'@satellatickets/ui': minor
---

En React Native, `Select` abre sus opciones en una hoja inferior, la misma de `Sheet`: sube desde el borde mientras el fondo se oscurece, y lleva de título el nombre del campo (la etiqueta del `FormField` o `accessibilityLabel`; si no hay ninguno, el placeholder). Antes era una lista centrada con su propio modal. Las props no cambian.

Cambian los `testID` de la lista: con `testID="ciudad"`, la hoja es `ciudad-list`, su ventana `ciudad-list-modal` y su fondo `ciudad-list-backdrop` (antes `ciudad-modal` y `ciudad-backdrop`).
