# ADR-046: Calendarios: `Calendar` y `DatePicker`, con las fechas como texto ISO

**Estado:** Aceptado
**Fecha:** 2026-10-09

Matiza a [ADR-026](026-crecimiento-del-catalogo.md) en el mismo punto que [ADR-045](045-tablas-de-datos.md): el momento en que entran los calendarios.

## Contexto

Los paneles de administración y de organización eligen fechas a cada paso: la de un evento al crearlo, el periodo de un informe de ventas, el día de una sesión. La web pública también: buscar eventos por fecha. Son varias apps con la misma necesidad, así que la regla de entrada de ADR-026 se cumple.

La plataforma no lo resuelve:

- En web, `<input type="date">` abre el calendario del navegador y del sistema, distinto en cada uno y ajeno al tema: el mismo problema que llevó a rehacer `Select` (ADR-042). No sabe elegir un periodo ni marcar los días que tienen eventos.
- React Native no trae ningún selector de fecha. Los de la comunidad son módulos nativos, y la librería no tiene hoy ninguna dependencia de ese tipo fuera de `react-native-svg` (ADR-033).

Hay además una decisión previa a cualquier componente: cómo se representa una fecha. Un día del calendario no es un instante. Un `Date` de JavaScript sí lo es, y convertirlo a día depende de la zona horaria de quien lo lee: `new Date('2026-10-09')` es el 8 de octubre en América. Es el fallo clásico de los selectores de fecha.

## Decisión

### Fechas

- Una fecha es un texto con el formato ISO 8601 de día, `'2026-10-09'`. Un mes, `'2026-10'`. Sin fecha, la cadena vacía, como en `Select` (ADR-037).
- No hay zona horaria en ningún punto: lo que la app guarda es lo que el usuario ha visto y pulsado. Un texto se compara y se ordena como texto, viaja tal cual en un formulario o en una URL, y es lo que espera una columna `date` de una base de datos.
- Un periodo es `{ start, end }`, con las dos fechas incluidas.
- "Hoy" es el día del dispositivo. La app puede fijarlo con `today` cuando su día de referencia es otro, por ejemplo el del lugar del evento.
- La aritmética (sumar días y meses, construir las semanas de un mes) son funciones puras de `core`, con sus tests.

### Textos

- Los nombres de los meses y de los días salen de `Intl.DateTimeFormat` con el `locale` que pasa la app. La librería sigue sin traer textos propios, y no añade una dependencia de fechas.
- `locale` es obligatorio. Con un valor por defecto tomado del entorno, el servidor y el navegador podrían no coincidir y la página fallaría al hidratarse.
- La semana empieza en lunes (`weekStartsOn`, de 0 a 6 con el domingo como 0). `Intl` no lo dice de forma fiable en todos los motores, y un valor fijo es el mismo en el servidor y en el cliente.
- Los nombres de los botones de mes anterior y siguiente los da la app.

### `Calendar`

- Un mes en una rejilla de siete columnas, con el título del mes y dos botones para cambiarlo. Siempre seis filas: la altura no cambia de un mes a otro. Los días de los meses vecinos no se pintan.
- Dos modos, con el mismo componente: `single` (una fecha) y `range` (un periodo). En `range`, la primera pulsación fija el inicio y la segunda el final, en el orden que sea; una tercera empieza de nuevo. Mientras falta el final, se adelanta el periodo hasta el día sobre el que está el puntero o el foco.
- Límites con `min` y `max`, días sueltos con `isDateDisabled`, y `isDateMarked` para señalar con un punto los días que tienen algo (eventos, ventas).
- El mes que se ve sigue ADR-037: controlado con `month`, o con estado propio. `onMonthChange` avisa al cambiar, para pedir los datos de ese mes.
- **Web:** el patrón de rejilla de fechas de ARIA. Una `<table role="grid">` con un botón por día; solo uno está en el orden de tabulación y entre ellos se va con las flechas. Inicio y Fin van a los extremos de la semana, RePág y AvPág cambian de mes y, con Mayúsculas, de año. Un día deshabilitado se puede enfocar, para no dejar huecos en el recorrido, pero no elegir.
- **Nativo:** la misma rejilla con vistas y un botón por día. Sin teclado de flechas, como `Tabs`.
- La lógica es un hook de `core`, `useCalendar`: qué días forman el mes, cuál está elegido, dentro del periodo o deshabilitado, y a dónde lleva cada tecla. Las dos vistas solo pintan.

### `DatePicker`

- Un campo de formulario con el aspecto de `Select`: un botón con la fecha elegida, escrita por `Intl`, que abre un `Calendar`. Se enlaza con `FormField` como los demás controles.
- **Web:** el calendario se pinta en la capa superior con la API Popover, bajo el campo, igual que la lista de `Select` (ADR-042). Al abrirse el foco pasa al día elegido; elegir un día cierra y devuelve el foco al campo, y Escape, pulsar fuera o salir con el tabulador cierran sin cambiar nada. Con `name`, la fecha viaja en un `<form>`.
- **Nativo:** el calendario se abre en la hoja inferior de `Sheet` (ADR-040), como las opciones de `Select`.
- Elige una fecha. El campo para un periodo queda para después: un `Calendar` en modo `range` ya se puede poner en una página o dentro de un `Sheet`.

Ambos entran en un grupo nuevo del catálogo, **Fechas**, como `experimental`.

## Alternativas descartadas

- **`Date` como valor.** Es lo que usan muchas librerías, y la causa de sus fallos de un día de diferencia. Obliga además a decidir qué hora lleva una fecha que no tiene hora.
- **`Temporal.PlainDate`.** Es justo este concepto, pero Hermes no lo tiene y en los navegadores es reciente. El texto ISO es su forma serializada: el día que se pueda usar, `Temporal.PlainDate.from(value)` funciona sin cambiar la API.
- **Una librería de fechas (date-fns, Day.js, Luxon) o de calendario (react-day-picker, React Aria).** La aritmética que hace falta son unas decenas de líneas, y `Intl` ya da los nombres. Sería la primera dependencia de ejecución del paquete (ADR-019), y las de calendario no tienen vista nativa.
- **`<input type="date">` en web.** El calendario abierto no se puede estilar, no hay periodos ni días marcados y Safari lo pinta a su manera. La misma razón de ADR-042.
- **Un módulo nativo de fecha en React Native.** Daría el selector del sistema, pero con otra dependencia nativa que cada app tendría que enlazar, y un aspecto distinto en cada plataforma.
- **Escribir la fecha con el teclado en el campo.** Exige interpretar formatos distintos según el idioma y validar lo escrito, y la librería no valida (ADR-037). Una app que lo necesite puede poner un `Input` junto a un `Calendar`.
- **Pintar los días de los meses vecinos.** Rellenan la rejilla, pero hay que decidir si se pueden pulsar y, en un periodo, qué significa que estén a la vista dos veces.
- **`locale` y primer día de la semana en `UIProvider`.** Sería lo cómodo si más componentes dependieran del idioma. Hoy solo estos dos; si aparecen más, se puede añadir sin romper la prop.

## Consecuencias

- Una fecha elegida es la misma en cualquier zona horaria, y se guarda sin convertir.
- La app que tenga `Date` convierte en el borde: al leer, con el año, el mes y el día locales; al guardar, al revés.
- Requiere `Intl.DateTimeFormat` con zona horaria UTC, que tienen todos los navegadores y Hermes en las versiones soportadas (ADR-024).
- Elegir un año lejano, como una fecha de nacimiento, es lento: se avanza mes a mes, o año a año con el teclado. Un selector de mes y año se evaluará con un caso real.
- Quedan fuera, a propósito: hora, varios meses a la vez, varias fechas sueltas, el campo para un periodo, atajos ("últimos 7 días") y la agenda de eventos por mes, que es otro componente.
- ADR-026 sigue en vigor en lo demás: los editores siguen esperando.
