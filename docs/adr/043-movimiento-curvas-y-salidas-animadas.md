# ADR-043: Movimiento: curvas en los tokens y salidas animadas

**Estado:** Aceptado
**Fecha:** 2026-10-09

## Contexto

Los componentes empezaron sin apenas movimiento. Al animar `Sheet` y el indicador de `Tabs` quedaron a la vista tres cosas sin decidir:

- **Las curvas.** Había tokens de duración (`duration.fast`, `duration.normal`…) pero la curva de cada animación estaba escrita a mano: `ease-out` en un CSS, `Easing.out(Easing.cubic)` en una vista nativa. Web y móvil no se movían igual, y nada obligaba a que dos componentes lo hicieran igual.
- **Las salidas.** Una entrada se anima sola: el elemento aparece y su animación arranca. Una salida no: cuando la app dice "cerrado", el elemento deja de pintarse y no queda nada que animar. Cada componente que quiera irse con una transición tiene que seguir en pantalla un poco más.
- **Los tests.** Las historias pasan por axe y por comprobaciones de visibilidad nada más pintarse. Las dos herramientas leen `opacity: 0` como contenido oculto, y un valor intermedio como texto de poco contraste: un fundido de entrada hace fallar el test según en qué fotograma caiga.

## Decisión

**Las curvas son tokens.** Tipo `cubicBezier` de DTCG, en tres papeles:

| Token | Para qué | Curva |
|---|---|---|
| `easing.enter` | Lo que aparece: llega rápido y frena | `0, 0, 0.2, 1` |
| `easing.exit` | Lo que se va: arranca despacio y acelera | `0.4, 0, 1, 1` |
| `easing.move` | Lo que cambia de sitio sin salir de la pantalla | `0.4, 0, 0.2, 1` |

En web son variables CSS (`cubic-bezier(…)`); en nativo, los cuatro números, para `Easing.bezier`. Las animaciones en bucle (`Spinner`, `Skeleton`) siguen con su curva propia: no entran ni salen.

**Qué se mueve y cuánto.**

| Componente | Entrada | Salida | Duración |
|---|---|---|---|
| `Sheet` | Sube desde el borde; el fondo se oscurece entero | Lo mismo al revés | `normal` |
| `Modal` | Fundido, con su fondo | Fundido | `fast` |
| Lista de `Select` (web) | Fundido | Fundido | `fast` |
| `Toast` | Sube un poco y aparece | Baja un poco y se desvanece | `normal` / `fast` |
| Indicador de `Tabs` | Se desliza a la pestaña elegida (`easing.move`) | — | `normal` |

**Las salidas, con el mismo mecanismo en todos.** El componente guarda lo que hay en pantalla en un estado que va por detrás de `open`: al cerrar, sigue pintándose mientras dura su salida.

- **Web:** la vista marca el elemento con `data-closing`, el CSS arranca la animación de salida y la vista espera a que terminen las animaciones del elemento (`afterAnimations`) para quitarlo. Si no hay ninguna, lo quita en el momento.
- **Nativo:** una animación de `Animated` con `useNativeDriver`, y al terminar, se quita.
- **Mientras se va no se puede pulsar ni existe para el lector de pantalla** (`aria-hidden` en web, `accessibilityElementsHidden` en nativo). La excepción es el `<dialog>` de `Modal` y `Sheet` en web, que sigue abierto de verdad hasta que termina: así no sale de la capa superior a media animación.

**Los fundidos animan `filter: opacity()`, no `opacity`.** Se ve igual, y ni axe ni las comprobaciones de visibilidad lo confunden con contenido oculto. El fondo de un diálogo (`::backdrop`) sí usa `opacity`: es un pseudo-elemento y ninguna de las dos lo mira.

**Movimiento reducido.** Con `prefers-reduced-motion: reduce` en web, o "Reducir movimiento" en el sistema en nativo, no hay animación: todo aparece, cambia de sitio y desaparece en el momento.

## Alternativas descartadas

- **Pedir movimiento reducido en el navegador de los tests.** Los vuelve deterministas de un plumazo, pero entonces la CI nunca ejecutaría una salida animada, que es donde está la lógica que puede fallar (un diálogo que no llega a cerrarse).
- **Transiciones con `@starting-style` y `transition-behavior: allow-discrete`.** Animan la salida de un elemento de la capa superior sin JavaScript, pero necesitan la propiedad `overlay`, que solo tiene Chromium.
- **Una librería de animación** (Reanimated en nativo, Motion en web). Son dependencias en tiempo de ejecución para cinco transiciones (ADR-033).
- **Una curva por componente.** Es lo que había.

## Consecuencias

- Web y móvil comparten duración y curva en cada transición.
- Un componente cerrado sigue en el DOM, o en el árbol nativo, lo que dura su salida: hasta 250 ms. Un test que compruebe que ha desaparecido nada más cerrarlo tiene que esperar, salvo que lo busque por su rol, porque para el lector de pantalla ya no existe.
- ADR-040 decía que el contenido de un diálogo solo se monta mientras está abierto. Sigue siendo así, con ese margen al cerrar.
- En Jest, React Native da por terminada una animación nativa a los 16 ms, dure lo que dure. Un test que mire el estado "mientras se va" con el reloj de verdad es una carrera: tiene que usar temporizadores falsos.
- Los valores animados de `Animated` no pasan por React: los tests nativos ven de dónde parte una animación, no a dónde llega. Las animaciones nativas se comprueban en un simulador.
