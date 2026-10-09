# @satellatickets/ui

## 0.5.0

### Minor Changes

- [#16](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/16) [`7dfd21e`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/7dfd21e90dd718649a3b09b219e59a827682fdb3) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - En web, la página de detrás ya no se desplaza mientras hay un `Modal` o un `Sheet` abierto (ADR-044). Antes la rueda del ratón y el dedo seguían moviéndola. Si la barra de desplazamiento ocupa sitio, se compensa su ancho para que nada salte al abrir ni al cerrar.
  
  Mientras el diálogo está en pantalla, la librería pone `overflow: hidden` en el elemento raíz del documento y lo restaura al cerrarse el último.

- [#16](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/16) [`7dfd21e`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/7dfd21e90dd718649a3b09b219e59a827682fdb3) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Más componentes entran y salen con una transición, con las mismas duraciones y curvas en web y en móvil (ADR-043).
  
  - `Modal` aparece y desaparece con un fundido también en web, junto con su fondo. En móvil ya lo hacía.
  - `Toast` se va con un fundido al cerrarse, en web y en nativo. Antes solo animaba la entrada.
  - La lista de `Select` en web aparece y desaparece con un fundido corto.
  - Las animaciones que ya había (`Sheet`, el indicador de `Tabs`, la entrada de `Toast`) toman su curva de los tokens `easing` nuevos en lugar de llevarla escrita.
  
  Con movimiento reducido en los ajustes del sistema, nada de esto se anima.
  
  Un `Modal`, un toast o una lista cerrados siguen en pantalla lo que dura su salida, hasta 150 ms, sin poder pulsarse. El toast y la lista dejan de existir para los lectores de pantalla en el momento, así que un test que los busque por su rol no cambia. Un test que compruebe que un `Modal` ha desaparecido nada más cerrarlo en web tiene que esperar (`waitFor`).

- [#16](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/16) [`7dfd21e`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/7dfd21e90dd718649a3b09b219e59a827682fdb3) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - En React Native, `Select` abre sus opciones en una hoja inferior, la misma de `Sheet`: sube desde el borde mientras el fondo se oscurece, y lleva de título el nombre del campo (la etiqueta del `FormField` o `accessibilityLabel`; si no hay ninguno, el placeholder). Antes era una lista centrada con su propio modal. Las props no cambian.
  
  Cambian los `testID` de la lista: con `testID="ciudad"`, la hoja es `ciudad-list`, su ventana `ciudad-list-modal` y su fondo `ciudad-list-backdrop` (antes `ciudad-modal` y `ciudad-backdrop`).

### Patch Changes

- Updated dependencies [[`50ca773`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/50ca773f51684e1625c36bae0492c34940c167f9)]:
  - @satellatickets/tokens@0.2.0
  - @satellatickets/core@0.3.1

## 0.4.0

### Minor Changes

- [#14](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/14) [`e106881`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/e1068811193ad90f78cd31ce74366705b5038447) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Sheet` entra y sale con una animación: la hoja sube desde el borde inferior mientras el fondo se oscurece entero, y al cerrarse baja mientras el fondo se aclara. Dura lo que marca el token `duration.normal` (250 ms).
  
  - En web aparecía y desaparecía de golpe.
  - En nativo se deslizaba la ventana completa, con el fondo dentro, y se veía subir el borde del oscurecido. Ahora el fondo aparece a la vez en toda la pantalla.
  - Con movimiento reducido en los ajustes del sistema, aparece y desaparece sin animación.
  
  Al cerrarse, la hoja y su contenido siguen en pantalla mientras dura la salida, sin poder pulsarse. Un test que compruebe que ha desaparecido nada más cerrarla tiene que esperar a que termine (`waitFor`). `Modal` no cambia.

- [#14](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/14) [`bbef41b`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/bbef41baffc50eb79a78b52a988e0d71773f645b) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - El indicador de `Tabs` se desliza de una pestaña a otra. Antes se apagaba bajo una y se encendía bajo la otra; ahora es una sola barra que se desplaza y cambia de ancho hasta la pestaña elegida, con el ratón, con el toque y con las flechas del teclado. Dura lo que marca el token `duration.normal` (250 ms).
  
  - Al cargar aparece ya en su sitio, y si las pestañas cambian de tamaño (llega la fuente, se estrecha la página) las sigue sin deslizarse.
  - Con movimiento reducido en los ajustes del sistema, cambia de sitio sin animación.
  - En web, la lista de pestañas lleva dentro un `<span aria-hidden="true">` nuevo, que es la barra. En el servidor, o sin JavaScript, el indicador sigue siendo el borde de la pestaña elegida.

## 0.3.0

### Minor Changes

- [#11](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/11) [`cc6f3bf`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cc6f3bf6932f9a3efbdcc3317cf8d4d1e3440a3c) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Select` pinta su propia lista también en web (ADR-042). Hasta ahora la lista abierta era la del navegador, distinta en cada uno y ajena al tema; ahora es la misma en Chrome, Safari y Firefox, con los colores, los radios y la tipografía de la librería.
  
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

### Patch Changes

- Updated dependencies [[`cc6f3bf`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cc6f3bf6932f9a3efbdcc3317cf8d4d1e3440a3c)]:
  - @satellatickets/core@0.3.0

## 0.2.1

### Patch Changes

- [#9](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/9) [`0220bf5`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/0220bf57669576f7833c7cee5b396ee04e92c9ab) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Los paquetes funcionan con los Server Components de Next.js (ADR-041). Hasta ahora, importar un componente desde una página o un layout de la App Router hacía fallar `next build` con `createContext is not a function`.
  
  - `ui`: el build web lleva la directiva `"use client"`. Ya no hace falta envolver los componentes en ficheros propios.
  - `core`: los contextos y los hooks se publican en un fichero aparte con `"use client"`, y el resto es código puro. Las constantes (`buttonVariants`, `textVariants`…) y las funciones puras (`resolveTheme`, `getTabInDirection`…) se pueden usar desde un Server Component. La API no cambia: todo se sigue importando de `@satellatickets/core`.
- Updated dependencies [[`0220bf5`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/0220bf57669576f7833c7cee5b396ee04e92c9ab)]:
  - @satellatickets/core@0.2.1

## 0.2.0

### Minor Changes

- [#7](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/7) [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Alert`, un mensaje dentro de la página que no desaparece solo. Entra con madurez `experimental`.
  
  - `tone` (`success`, `warning`, `danger`, `info`) fija el color y el icono. `danger` y `warning` interrumpen al lector de pantalla; `success` e `info` esperan a que termine de leer.
  - `title` y una descripción como `children`, que admite contenido propio, por ejemplo un enlace.
  - Con `onClose` muestra un botón de cierre; su nombre accesible lo pone la app con `closeLabel`, obligatorio en ese caso.
  - `core` publica el contrato `AlertProps`.

- [#8](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/8) [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Card`, una superficie que agrupa contenido relacionado. Entra con madurez `experimental`.
  
  - Variantes `outlined` y `elevated`, que añade sombra. `padding` acepta un espacio de los tokens; con `0`, el contenido llega hasta el borde y la tarjeta lo recorta a su radio.
  - Con `onPress`, toda la tarjeta es un botón: se pulsa con ratón, teclado o toque, y su nombre accesible es su contenido. En ese caso no debe contener otros controles.
  - `core` publica el contrato `CardProps` y la constante `cardVariants`.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Checkbox`, una opción que se marca o no, con su etiqueta como `children`. Entra con madurez `experimental`.
  
  - Controlada con `checked` o no controlada con `defaultChecked`; avisa con `onCheckedChange(marcada)`. `indeterminate` la pinta como parcialmente marcada.
  - Estados `disabled` e `invalid`. Sin etiqueta visible necesita `accessibilityLabel`.
  - En web es un `<input type="checkbox">` real y viaja en un `<form>` con `name` y `value`. En nativo amplía su área táctil hasta 44 puntos.
  - `core` publica el contrato `CheckboxProps` y el hook `useControllableState`.

- [#8](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/8) [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Divider`, una línea fina que separa dos bloques de contenido. `orientation` es `horizontal` (por defecto) o `vertical`, para elementos de una fila. En web es un `<hr>` o un `role="separator"`; en nativo es decorativo. Entra con madurez `experimental`. `core` publica el contrato `DividerProps` y la constante `dividerOrientations`.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `FormField`, la etiqueta, la ayuda y el error de un control, enlazados con él para los lectores de pantalla. Envuelve un `Input`, un `TextArea` o un `Select`. Entra con madurez `experimental`.
  
  - `label`, `help` y `error` son texto. Con `error`, el control se marca como inválido; `required` y `disabled` se propagan al control.
  - En web usa `<label htmlFor>` y `aria-describedby`, y el error se anuncia al aparecer. En nativo el control toma la etiqueta como nombre accesible y el error y la ayuda como pista (ADR-037).
  - `core` publica el contrato `FormFieldProps`, el contexto `FormFieldContext`, `createFormFieldValue`, `resolveFormFieldControl` y el hook `useFormFieldControl`, para que un control propio de una app se pueda enlazar igual.

- [#4](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/4) [`823d310`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/823d310b8e69118db5302900c8f6cb3242668193) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `IconButton`, un botón cuadrado cuyo único contenido es un icono. Comparte variantes, tamaños y estados con `Button`, y mide de lado lo que un `Button` de alto. `label` es obligatorio y es su nombre accesible. Por defecto es `ghost`. Mientras carga sustituye el icono por un spinner y no dispara `onPress`. Entra con madurez `experimental`. `core` publica el contrato `IconButtonProps` y la constante `iconButtonIconSize`.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Icon` acepta en `color`, además de los colores de texto, los cuatro estados de feedback: `success`, `warning`, `danger` e `info`, que usan el token `color.feedback.<estado>.icon`. `core` publica `feedbackTones`, `isFeedbackTone` y el tipo `IconColor`.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Input`, un campo de texto de una línea. Entra con madurez `experimental`.
  
  - `type` (`text`, `email`, `password`, `search`, `tel`, `url`, `number`) elige el teclado y el autocompletado de cada plataforma. `number` es un campo de texto con teclado numérico, no un `type="number"`.
  - Tamaños `sm`, `md` y `lg`, con las mismas alturas que `Button`. Estados `disabled`, `readOnly` e `invalid`, e iconos decorativos con `iconStart` e `iconEnd`.
  - Controlado con `value` o no controlado con `defaultValue`; avisa con `onChangeText(texto)`. `onSubmit` se llama con Intro o con la tecla de envío del teclado.
  - En web el foco se dibuja en toda la caja, y pulsar el borde o un icono enfoca el campo. Acepta `name` y `autoComplete`.
  - `core` publica el contrato `InputProps` y las constantes `inputTypes`, `inputIconSize` y `controlSizes`.

- [#4](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/4) [`823d310`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/823d310b8e69118db5302900c8f6cb3242668193) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Link`, un enlace de texto. Entra con madurez `experimental`.
  
  - Dentro de un `Text` hereda su tipografía y fluye con el párrafo; fuera usa `body`. Con `variant` toma la tipografía de esa variante de `Text`.
  - `color` acepta los colores de texto (por defecto `link`) y `underline` decide si se subraya siempre (`always`, por defecto) o solo al interactuar (`hover`).
  - `onPress` se llama antes de navegar y puede cancelar la navegación con `event.preventDefault()`, para hacerla con el router de la app. En web no se llama si el clic lleva un modificador.
  - En web es un `<a>`; con `target="_blank"` añade `rel="noopener noreferrer"`. En nativo abre el destino con `Linking`.
  - `core` publica el contrato `LinkProps`, el tipo `LinkPressEvent`, la constante `linkUnderlines` y el hook `useLink`.

- [#8](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/8) [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Modal` y `Sheet`: un diálogo que interrumpe lo que hay debajo (ADR-040). `Modal` se centra y `Sheet` se ancla al borde inferior; comparten contrato. Entran con madurez `experimental`.
  
  - Controlados: `open` lo decide la app y el diálogo pide cerrarse con `onClose`. El contenido solo se monta mientras está abierto.
  - `title` es obligatorio y es su nombre accesible; `description`, `footer` y el contenido son opcionales. El botón de cierre aparece si la app pasa `closeLabel`.
  - Con `dismissible={false}`, ni Escape, ni pulsar fuera, ni el botón atrás de Android lo cierran.
  - En web es un `<dialog>` real abierto con `showModal()`: el navegador atrapa el foco, deja inerte el resto de la página y lo pinta por encima de todo. En nativo es el `Modal` de React Native.
  - `core` publica los contratos `ModalProps` y `SheetProps` y la constante `modalPresentations`.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Select`, para elegir una opción de una lista. Entra con madurez `experimental`.
  
  - `options` es una lista de `{ value, label, disabled? }`. Controlado con `value` o no controlado con `defaultValue`; avisa con `onValueChange(value)`. `placeholder` se muestra mientras no hay opción elegida.
  - Tamaños `sm`, `md` y `lg`, y estados `disabled` e `invalid`, como `Input`.
  - En web es un `<select>` real: el teclado, los lectores de pantalla y el selector del sistema en móvil son los del navegador. En nativo es un disparador que abre una lista modal propia, sin dependencias nuevas (ADR-038).
  - `core` publica los contratos `SelectProps` y `SelectOption`.

- [#7](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/7) [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Skeleton`, el hueco de un contenido que todavía se está cargando. Entra con madurez `experimental`.
  
  - Formas `text`, `rectangle` y `circle`. En `text`, cada línea ocupa lo mismo que una línea de `Text` de la `variant` indicada, así que nada se mueve al llegar el contenido; `lines` pinta varias, con la última más corta.
  - `width` admite puntos o un porcentaje del contenedor, y `height`, puntos.
  - Late entre dos fondos del tema y se queda quieto con movimiento reducido. Es decorativo: los lectores de pantalla lo ignoran.
  - `core` publica el contrato `SkeletonProps` y la constante `skeletonShapes`.

- [#7](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/7) [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Spinner` deja de ser la versión mínima: tiene un tamaño `xl` de 32 puntos para la carga de una página o de una sección, y con movimiento reducido gira más despacio en vez de pararse. `Icon` comparte la escala y gana también el tamaño `xl`. En nativo, `Switch` respeta el movimiento reducido igual que en web.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Switch`, un ajuste que se activa o desactiva con efecto inmediato, con su etiqueta como `children`. Controlado con `checked` o no controlado con `defaultChecked`; avisa con `onCheckedChange(activado)`. En web es un `<input type="checkbox" role="switch">` real; en nativo, un control con su pulgar animado y un área táctil de 44 puntos. Entra con madurez `experimental`. `core` publica el contrato `SwitchProps`.

- [#8](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/8) [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Tabs`, para cambiar entre varias vistas del mismo nivel sin salir de la página. Entra con madurez `experimental`.
  
  - `items` es una lista de `{ value, label, icon?, disabled?, content? }`. Con `content`, `Tabs` pinta el panel de la pestaña elegida; sin él, solo las pestañas, y la app decide qué mostrar.
  - Controlado con `value` o no controlado con `defaultValue`; avisa con `onValueChange(value)`. Empieza en la primera pestaña habilitada.
  - En web sigue el patrón de pestañas de ARIA: solo la elegida está en el orden de tabulación y las flechas, Inicio y Fin se mueven entre ellas saltando las deshabilitadas. Si no caben, la lista se desplaza en horizontal.
  - `core` publica los contratos `TabsProps` y `TabItem`, y las funciones `getTabInDirection` y `firstEnabledTab`.

- [#6](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/6) [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `TextArea`, un campo de texto de varias líneas, con los mismos estados que `Input`. `rows` fija cuántas líneas se ven; en web se puede redimensionar en vertical y en nativo crece con el texto. Entra con madurez `experimental`. `core` publica el contrato `TextAreaProps`.

- [#7](https://github.com/RobertoRodriguezCarbonell/satella-ui/pull/7) [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Toasts: avisos breves que aparecen sobre la interfaz y desaparecen solos (ADR-039). Entran con madurez `experimental`.
  
  - Se lanzan con `useToast()`: `show({ tone, title, description, duration, action, closeLabel })` devuelve el `id` del aviso y `dismiss(id)` lo cierra. No hay componente que colocar.
  - `UIProvider` guarda la cola y pinta los avisos pegados al borde inferior. Uno anidado reutiliza la zona del de fuera.
  - Se cierran a los 5 segundos por defecto; con `duration: 0`, cuando alguien los cierre. Como mucho hay tres a la vez. En web el cierre se pausa mientras el puntero o el foco están sobre ellos.
  - `danger` y `warning` interrumpen al lector de pantalla; `success` e `info` esperan. En nativo se anuncian con `AccessibilityInfo`.
  - `core` publica `createToastStore`, `ToastContext`, `useToast`, las constantes `TOAST_DEFAULT_DURATION` y `TOAST_MAX_VISIBLE`, y los tipos `ToastOptions`, `ToastAction`, `ToastItem` y `ToastApi`.

### Patch Changes

- Updated dependencies [[`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96), [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`823d310`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/823d310b8e69118db5302900c8f6cb3242668193), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`823d310`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/823d310b8e69118db5302900c8f6cb3242668193), [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96), [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`4aac0bb`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4aac0bbac391f0166ee86a9752d4fae60c436951), [`cabfef3`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/cabfef3c87821da14784aced050e167172b84a10), [`f79251c`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/f79251cd3b84e0f4bc8b879ceeb243ddec1ecd96)]:
  - @satellatickets/core@0.2.0

## 0.1.0

### Minor Changes

- [`3dd5519`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/3dd5519e49a3175e597f71e5c8b8a4c870952aee) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Badge`, una etiqueta de estado con las variantes `success`, `warning`, `danger` e `info`. Cada una usa el fondo, el borde y el texto de su color de `color.feedback`, así que cambia con el tema y con la marca. Entra con madurez `experimental`. `core` publica el contrato `BadgeProps` y la constante `badgeVariants`.

- [`a5e8064`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a5e8064a7da9e29580cd976516f55cc05dfa7325) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Fundamentos (Fase 2 del ROADMAP), con madurez `experimental`:
  
  - `UIProvider` con la misma API en web y nativo (`theme`: light | dark | system, `brand`), anidable; hooks `useTheme`, `useColorScheme` y `useBrand`. En web pone `data-theme`/`data-brand` en un contenedor sin caja propia; en nativo entrega el tema por contexto.
  - `Box` (relleno, fondo, radio, borde, sombra), `Stack` (dirección, separación, alineación), `Text` (diez variantes tipográficas con la escala de Satella) e `Icon` (iconos de lucide con `react-native-svg` en nativo, peer opcional).
  - `core` publica los contratos y constantes de variantes de los cuatro componentes y el contexto de tema.
  - Build de `ui` con doble salida y `styles.css` (CSS Modules compilados) para web.

- [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Button`, el componente de referencia (Fase 3 del ROADMAP), y un `Spinner` mínimo. Ambos entran con madurez `experimental`.
  
  - `Button`: variantes `primary`, `secondary`, `ghost` y `danger`; tamaños `sm`, `md` y `lg`; `iconStart` e `iconEnd`; `fullWidth`; `disabled` y `loading`. Mientras carga no dispara `onPress`, pero conserva el foco, el nombre accesible y la anchura. En web es un `<button>` (`type="button"` por defecto) con hover, pulsado y anillo de foco en CSS; en nativo, un `Pressable` con su estado de accesibilidad y un área táctil mínima de 44 puntos.
  - `Spinner`: indicador de carga con la escala de tamaños de `Icon`; con `label` se anuncia como progreso indeterminado.
  - `core` publica los contratos `ButtonProps` y `SpinnerProps`, las constantes `buttonVariants`, `buttonIconSize` y `spinnerSizes`, y el hook `useButton`.
  - Corrección en web: un `Box` o un `Stack` anidado ya no hereda el relleno, el fondo, el borde, el radio, la sombra ni la separación del que lo contiene.

- [`873a07f`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/873a07f5f4dd638f9cffdfd8474788d8d4df2fe0) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Los tipos de props propios de cada plataforma se exportan solo donde existen: `ButtonWebProps`, `BoxWebProps`, `TextElement` y el resto de tipos `*WebProps` en la versión web; los `*NativeProps` en la de React Native. Los tipos comunes (`ButtonProps`, `BoxProps`…) no cambian. Antes, los tipos de la versión web importaban `react-native`, y el typecheck de una app web fallaba con `skipLibCheck: false`.
  
  El paquete incluye ahora un README con la instalación y el uso en cada plataforma.

### Patch Changes

- [`c4e9138`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/c4e9138ab13505b37bb26e55c22e1aa6314a8cf9) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Esqueleto inicial del monorepo (Fase 0 del ROADMAP): build con tsdown, TypeScript estricto, ESLint con reglas de fronteras entre capas, Vitest, Changesets y CI. Los paquetes todavía no exponen API pública.

- [`a9427c9`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a9427c967d87af04498fe7f90dea80abd8c01a06) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Los tres paquetes incluyen el fichero de licencia MIT. `ui` incluye además `NOTICE.md`, con la licencia ISC de los iconos de Lucide que lleva dentro.
- Updated dependencies [[`3dd5519`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/3dd5519e49a3175e597f71e5c8b8a4c870952aee), [`c4e9138`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/c4e9138ab13505b37bb26e55c22e1aa6314a8cf9), [`4fb80d4`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4fb80d4d0bcaf590018fb59000d7b2c273d11ca3), [`a5e8064`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a5e8064a7da9e29580cd976516f55cc05dfa7325), [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406), [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406), [`a9427c9`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a9427c967d87af04498fe7f90dea80abd8c01a06), [`873a07f`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/873a07f5f4dd638f9cffdfd8474788d8d4df2fe0)]:
  - @satellatickets/core@0.1.0
  - @satellatickets/tokens@0.1.0
