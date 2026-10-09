---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Select` pinta su propia lista también en web (ADR-042). Hasta ahora la lista abierta era la del navegador, distinta en cada uno y ajena al tema; ahora es la misma en Chrome, Safari y Firefox, con los colores, los radios y la tipografía de la librería.

- La lista sale bajo el campo, con su ancho, por encima de todo: no la recorta un `Modal` ni una `Card`. Si debajo no cabe, se abre hacia arriba, y una lista larga se desplaza.
- La opción elegida lleva una marca. Las opciones siguen el tamaño del campo (`sm`, `md`, `lg`).
- Teclado: las flechas, Inicio, Fin, AvPág y RePág mueven el resaltado; Intro, Espacio y Tab eligen; Escape cierra sin elegir, también dentro de un `Modal`. Escribir busca la opción que empieza por ese texto, sin distinguir mayúsculas ni acentos.
- `core` publica las funciones puras `getOptionInDirection` y `findOptionByText`, la constante `optionDirections` y `OPTION_PAGE_SIZE`.

**Cambio incompatible en web.** Las props no cambian, pero sí el HTML: ya no hay un `<select>`.

- `ref` apunta al botón que abre la lista: `Ref<HTMLButtonElement>` en lugar de `Ref<HTMLSelectElement>`. `id` y `testID` también van en ese botón.
- En los tests, la opción se elige pulsándola: `userEvent.selectOptions` y `toHaveValue` ya no sirven. El valor se comprueba con el texto del disparador (`role="combobox"`) o con `onValueChange`.
- Con `name`, el valor sigue viajando en el `<form>`, ahora en un `<input type="hidden">`.
- En un móvil se abre esta misma lista, no el selector del sistema, y el autocompletado del navegador no rellena el campo.
- Pulsar la etiqueta de un `FormField` abre la lista.

En nativo no cambia nada.
