# ADR-045: Tablas de datos: `Table` guiada por columnas y `Pagination`

**Estado:** Aceptado
**Fecha:** 2026-10-09

Matiza a [ADR-026](026-crecimiento-del-catalogo.md) en un punto: el momento en que entran las tablas.

## Contexto

ADR-026 dejó los componentes de dominio, las tablas de datos entre ellos, para "cuando el núcleo sea `stable`". El núcleo sigue en `experimental`, pero las tablas ya hacen falta: el panel de administración y el de organización son, sobre todo, listados (eventos, pedidos, asistentes, liquidaciones). Son dos apps, así que la regla de entrada de ADR-026 se cumple; lo que se adelanta es el orden. Esperar a que el núcleo sea `stable` significaría que cada panel escribiera su propia tabla y que después hubiera que migrar dos.

Una tabla es el componente del catálogo donde más se separan las dos plataformas:

- En web existe `<table>`: el navegador reparte el ancho de las columnas según su contenido y los lectores de pantalla saben moverse por filas y columnas y leen la cabecera de cada celda.
- En React Native no existe nada parecido. No hay algoritmo de tabla (cada fila es una vista independiente y nada alinea sus celdas con las de la fila siguiente) ni rol de tabla que VoiceOver o TalkBack entiendan.

Además, en un panel los datos casi nunca están enteros en el cliente: llegan por páginas y ya ordenados desde el servidor.

## Decisión

### `Table`

- **Guiada por datos.** La app pasa `columns` y `rows`, igual que `Tabs` recibe `items` y `Select` recibe `options`. Cada columna dice cómo se llama (`header`) y cómo se pinta su celda (`cell: (row) => …`). `Table` es genérica en el tipo de la fila. Es lo que permite el mismo contrato en las dos plataformas: la vista conoce las columnas antes de pintar ninguna fila, y con eso puede alinearlas, darles nombre accesible y repartir el ancho.
- **Web:** un `<table>` real, con `<th scope="col">` en la cabecera y, en la columna marcada con `rowHeader`, `<th scope="row">`. El ancho lo reparte el navegador según el contenido; `width` y `minWidth` de una columna lo fijan o lo acotan. La tabla vive dentro de un contenedor que se desplaza en horizontal cuando no cabe. Solo entonces ese contenedor es una región enfocable con el nombre de la tabla, para que el teclado pueda desplazarla; si cabe, no añade una parada de tabulación.
- **Nativo:** una rejilla hecha con vistas. Cada columna mide `width` si lo tiene; si no, parte de `minWidth` (por defecto 128 pt, lo que ocupa una cabecera de una palabra) y crece con las demás hasta llenar el ancho. Ese reparto lo calcula una función pura de `core` (`getColumnWidths`) y la vista da a cada celda su ancho exacto: dentro de un contenedor que se desplaza en horizontal el ancho de una fila no está definido, y flexbox mediría cada celda por su contenido, con lo que las columnas no quedarían alineadas de una fila a otra. Si la suma no cabe en la pantalla, la tabla se desplaza en horizontal. A falta de rol de tabla, cada celda de texto se anuncia con el nombre de su columna ("Estado, Pagado").
- **Presentación, no datos.** `Table` pinta las filas que recibe y en el orden en que las recibe: no ordena, no filtra y no pagina. Quien tiene los datos es la app o el servidor; ordenar en el cliente una sola página daría un resultado falso.
- **Ordenación:** una columna con `sortable` tiene por cabecera un botón. `sort` (`{ column, direction }`) dice cuál está ordenada y `onSortChange` avisa de la que se pide: ascendente la primera vez, y cada pulsación sobre la misma invierte el sentido. Sigue ADR-037: controlada con `sort`, o con estado propio a partir de `defaultSort`. En web el sentido se comunica con `aria-sort`; en nativo, con el estado seleccionado y con los textos de `sortDirectionLabels`.
- **Selección:** con `selectable`, cada fila lleva una casilla y la cabecera otra que marca o desmarca todas las filas que se ven, con estado intermedio si solo lo están algunas. `selectedKeys` guarda las claves (`getRowKey`), así que la selección sobrevive al cambiar de página: marcar todas añade las de la página actual y no quita las demás. Los nombres accesibles de las casillas (`selectAllLabel`, `getRowSelectionLabel`) son obligatorios con `selectable`: la librería no trae textos.
- **Carga y vacío:** con `loading`, las filas se sustituyen por huecos (`Skeleton`), tantos como filas había o `loadingRowCount` si no había ninguna, y la tabla se marca como ocupada. Sin filas y sin carga, se muestra `empty`.
- **Aspecto:** una superficie con borde y esquinas redondeadas, cabecera con la tipografía de etiqueta de la identidad (monoespaciada y en mayúsculas), filas separadas por una línea y dos densidades (`size`: `sm` y `md`) cuyas filas miden como mínimo lo que un control de ese tamaño. La fila seleccionada se tiñe con `color.accent.bg`.
- **Lógica compartida:** el siguiente orden, las operaciones de selección y el reparto de anchos son funciones puras de `core` (`getNextSort`, `getSelectionState`, `toggleSelectedKey`, `toggleAllSelected`, `getColumnWidths`), con sus tests.

### `Pagination`

- Un componente aparte, no una parte de `Table`: también pagina listas de tarjetas, y una tabla con pocos datos no la necesita.
- Recibe `page` (empieza en 1) y `pageCount`, y avisa con `onPageChange`. Pinta anterior, siguiente y los números de página, resumidos con puntos suspensivos alrededor de la actual; el número de elementos no cambia al pasar de página, así que los botones no se mueven bajo el puntero. Qué páginas se muestran lo calcula una función pura de `core` (`getPaginationItems`).
- En web es un `<nav>` con una lista de botones y `aria-current="page"` en la actual. En nativo, una fila de botones con la actual como seleccionada.
- Los nombres accesibles (`accessibilityLabel`, `previousLabel`, `nextLabel`) son obligatorios; `getPageLabel` da el de cada número ("Página 3") y, sin él, es el propio número.

Ambos entran en un grupo nuevo del catálogo, **Datos**, como `experimental`.

## Alternativas descartadas

- **API por composición (`<Table><TableRow><TableCell>`).** Es la más flexible en web, pero nada garantiza la paridad: en nativo una celda no sabe a qué columna pertenece, así que no puede alinearse con la de arriba ni anunciar su cabecera, y cada app tendría que cablear a mano la ordenación y la selección. Se puede añadir más adelante por encima de esta si aparece un caso que `columns` no cubra.
- **Un motor de tablas sin interfaz (TanStack Table) como dependencia.** Resuelve filtrado, agrupación y paginación en el cliente, que aquí no se quieren dentro del componente, y añadiría la primera dependencia de ejecución fuera de React (ADR-019). Una app puede usarlo para su estado y pasarle a `Table` el resultado.
- **Que `Table` ordene o pagine las filas.** Solo sería correcto con todos los datos en el cliente, que no es el caso habitual de un panel, y obligaría a dos modos con comportamientos distintos.
- **En nativo, una tarjeta por fila en lugar de una rejilla.** Es lo habitual en un móvil, pero deja de ser una tabla: no se pueden comparar valores en vertical y el componente no sabe qué columna es el título de la tarjeta. Queda como evolución posible (una prop de presentación), sin romper el contrato.
- **`role="grid"` con navegación por celdas con las flechas.** Es el patrón de una hoja de cálculo. Una tabla de datos con algunos controles dentro se recorre mejor con el orden de tabulación normal, y un `grid` obliga a gestionar el foco de todo lo que haya en cada celda.
- **Filas pulsables.** Una fila que es a la vez un enlace y contiene casillas y botones anida controles, y en web no tiene un elemento HTML que la represente. La navegación al detalle va en una celda, con `Link`. Se puede reconsiderar con un caso real.
- **Marcar `aria-sort="none"` en las columnas ordenables sin ordenar.** Es válido, pero los lectores de pantalla lo leen en cada celda de cabecera; el botón ya dice que la columna se puede ordenar.

## Consecuencias

- Los dos paneles comparten tabla y paginación, con el tema y la marca de cada uno.
- La app es responsable de pedir los datos en el orden y la página que indican `sort` y `page`. Si ordena en el cliente, lo hace ella antes de pasar `rows`.
- El reparto de anchos no es idéntico en las dos plataformas: en web manda el contenido, en nativo mandan `width` y `minWidth`. Una tabla con muchas columnas se desplaza en horizontal en un móvil; lo que debe verse siempre va en las primeras columnas.
- `getRowKey` es obligatorio: las claves identifican la fila para React y para la selección.
- Quedan fuera, a propósito: cabecera o columnas fijas al desplazarse, virtualización de filas, cambiar el ancho o el orden de las columnas, filas que se despliegan, pie con totales, filas no seleccionables y selección de una sola fila. Cada una se evaluará con un caso real.
- ADR-026 sigue en vigor en todo lo demás: la regla de entrada, los niveles de madurez y el resto de componentes de dominio (calendarios, editores), que siguen esperando.
