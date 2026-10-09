# ADR-042: `Select` pinta su propia lista también en web

**Estado:** Aceptado
**Fecha:** 2026-10-09

Sustituye a [ADR-038](038-select-nativo-en-web-y-lista-modal-en-nativo.md).

## Contexto

ADR-038 dejó la lista desplegable de `Select` en manos del navegador: en web se renderizaba un `<select>` real y solo se estilaba la caja cerrada. La consecuencia que entonces se aceptó es la que ahora molesta: la lista abierta tiene el aspecto del navegador y del sistema donde se ejecuta, distinto en cada uno y ajeno al tema de la librería. En un producto con identidad propia, y oscuro, se nota.

La plataforma ya permite estilar la lista de un `<select>` con `appearance: base-select`, pero no en todos los navegadores (comprobado el 2026-10-09):

| Navegador | `appearance: base-select` |
|---|---|
| Chrome y Edge | Desde la 135 (abril de 2025) |
| Safari | Anunciado para la 27; la 26 y anteriores no lo tienen |
| Firefox | Sin fecha |

Con esa opción, quien use Firefox o un iPhone sin actualizar seguiría viendo la lista del sistema. No resuelve el problema, solo lo esconde en el navegador de quien desarrolla.

Lo que sí admiten todos los navegadores desde abril de 2024 (Chrome 114, Safari 17, Firefox 125) es la API Popover: un elemento con el atributo `popover` se pinta en la capa superior del navegador, la misma que usa `<dialog>` (ADR-040), por encima de todo y sin que lo recorte ningún contenedor.

## Decisión

- **Web:** `Select` deja de renderizar un `<select>`. Sigue el patrón de ARIA de combobox de solo selección:
  - El disparador es un `<button role="combobox">` dentro de la caja compartida de los campos. Conserva el foco todo el tiempo.
  - La lista es un `role="listbox"` con un `role="option"` por opción. Se monta solo mientras está abierta y se pinta en la capa superior con la API Popover, colocada con `position: fixed` bajo el disparador y con su mismo ancho. Si debajo no cabe y arriba hay más sitio, se abre hacia arriba. Su altura se limita al espacio disponible y, como máximo, a unas siete opciones; el resto se desplaza.
  - La opción resaltada se comunica con `aria-activedescendant`. La elegida lleva `aria-selected` y una marca.
  - Teclado: las flechas, Inicio, Fin, AvPág y RePág mueven el resaltado sin dar la vuelta y saltando las opciones deshabilitadas. Intro y Espacio abren la lista y eligen la opción resaltada. Tab la elige y sigue su camino. Escape cierra sin elegir. Escribir busca por el principio del texto, sin distinguir mayúsculas ni acentos.
  - Se cierra sin elegir al pulsar fuera o al perder el foco.
  - Con `name`, el valor viaja en un `<form>` mediante un `<input type="hidden">`.
- **Lógica compartida:** moverse entre opciones y buscar por texto son funciones puras de `core` (`getOptionInDirection`, `findOptionByText`), con sus tests unitarios.
- **Nativo:** no cambia. Un disparador con aspecto de `Input` abre una lista modal propia, hecha con `Modal`, `ScrollView` y `Pressable` de React Native. Se cierra al elegir, tocando fuera o con el botón atrás de Android.
- **El contrato no cambia:** `options` como lista de `{ value, label, disabled? }`, `value`, `defaultValue`, `onValueChange` y `placeholder`. En web cambia el tipo de `ref`, que pasa a ser el del botón.

## Alternativas descartadas

- **`appearance: base-select` como mejora progresiva.** Sin JavaScript y conservando el `<select>`, pero solo estila la lista en Chromium. Se puede reconsiderar cuando Safari y Firefox lleven dos años con ello: la API de `Select` no tendría que cambiar.
- **Una librería de componentes sin estilo (Radix, React Aria, Headless UI).** Resuelven este patrón, pero añaden una dependencia en tiempo de ejecución a un paquete que hoy no tiene ninguna fuera de React (ADR-019), para un solo componente.
- **La lista como hija posicionada de la caja, con `z-index`.** La recortaría cualquier contenedor con `overflow`, como el cuerpo de un `Modal` o una `Card`, y competiría con el `z-index` de la app.
- **Posicionamiento con anclas de CSS (`anchor()`).** Firefox lo admite desde enero de 2026 y Safari desde la 26: demasiado reciente. Medir el disparador son pocas líneas y funciona en todos.
- **Mantener el `<select>` en pantallas táctiles.** El selector del sistema es cómodo en un móvil, pero habría dos aspectos distintos según el dispositivo, que es lo que se quiere evitar.

## Consecuencias

- La lista se ve igual en todos los navegadores y sigue el tema y la marca.
- El foco, el teclado y los nombres accesibles son ahora código de la librería. Se prueban con las historias (ADR-016) y, antes de aceptar este ADR, a mano en Chromium, WebKit y Firefox.
- En un móvil ya no se abre el selector del sistema, sino la misma lista.
- El autocompletado del navegador no rellena un `Select`, porque no hay un `<select>` que reconozca. Si una app lo necesita en un formulario de dirección, se puede añadir uno oculto sin cambiar la API.
- Pulsar la etiqueta de un `FormField` abre la lista, porque activa el botón. Con el `<select>` solo lo enfocaba.
- Es un breaking change en web (ADR-025): cambia el HTML renderizado y el tipo de `ref`.
- Requiere la API Popover. En un navegador anterior a los citados la lista se pinta igualmente con `position: fixed`, sin capa superior.
- Opciones agrupadas, búsqueda con campo de texto y selección múltiple siguen fuera. Lo segundo y lo tercero serían un componente distinto (`Combobox`).
- Cuando la lista modal nativa pase a usar la base de `Modal` y `Sheet` (ADR-040), su API tampoco cambia.
