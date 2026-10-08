# ADR-040: `Modal` y `Sheet` comparten contrato y usan `<dialog>` en web y `Modal` en nativo

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

Un diálogo modal interrumpe lo que hay debajo hasta que se responde o se cierra. Hacerlo bien exige cuatro cosas que no son de estilo: que el foco no pueda salir de él, que lo de debajo no se pueda usar, que se pinte por encima de todo sin depender del `z-index` de la app, y que se cierre con el gesto de cada plataforma (Escape, el botón atrás de Android).

El ROADMAP pide dos presentaciones: `Modal`, centrado, y `Sheet`, anclado al borde inferior. Solo cambia dónde se coloca; el comportamiento es el mismo.

Las dos plataformas ya traen la pieza:

- Web: el elemento `<dialog>` con `showModal()` atrapa el foco, deja inerte el resto de la página, se pinta en la capa superior del navegador y avisa con el evento `cancel` cuando el usuario pide cerrarlo. Lo admiten todos los navegadores de la ventana de soporte (ADR-024).
- React Native: el componente `Modal` pinta una ventana por encima de la app y avisa con `onRequestClose` del botón atrás de Android.

## Decisión

- **Un contrato, dos componentes.** `Modal` y `Sheet` tienen las mismas props. Una implementación interna común (`ModalDialog`) recibe además la presentación.
- **Controlados.** `open` lo decide la app. El componente pide cerrarse con `onClose` y la app responde poniendo `open` a `false`. El contenido solo se monta mientras está abierto.
- **Web:** un `<dialog>` real abierto con `showModal()`. Escape y los demás gestos de cierre del navegador llegan por su evento `cancel`; pulsar el fondo cierra porque el fondo pertenece al propio `<dialog>`. No hay portal ni `z-index`.
- **Nativo:** el `Modal` de React Native, con el fondo como zona pulsable para cerrar.
- **`dismissible`** (por defecto `true`). Con `false`, ni Escape, ni el fondo, ni el botón atrás lo cierran: es para una pregunta que exige respuesta.
- **Textos, solo los de la app.** `title` es obligatorio y es el nombre accesible. El botón de cierre aparece si la app pasa `closeLabel`.

## Alternativas descartadas

- **Un `div` con `role="dialog"`, portal y trampa de foco propia.** Es reimplementar lo que `<dialog>` ya hace, y la trampa de foco y la inercia del fondo son de las piezas que más fallan en las librerías.
- **Un solo componente con una prop `presentation`.** Funciona igual, pero `<Sheet>` se lee mejor en el código de una app que `<Modal presentation="sheet">`, y el ROADMAP los nombra por separado.
- **No controlado, con un disparador dentro (`<Modal trigger={…}>`).** Los diálogos se abren a menudo tras una acción asíncrona o desde un sitio distinto del árbol; con `open` la app decide.
- **Una librería de hojas inferiores con gestos en nativo.** Arrastrar para cerrar exige `react-native-gesture-handler` y `reanimated` como dependencias de la librería (ADR-033 las evita). Queda fuera por ahora.

## Consecuencias

- El foco, la inercia del fondo y el apilamiento los resuelve cada plataforma. La librería no tiene código propio para eso, ni lo prueba: confía en el navegador y en React Native.
- En web, el fondo de la página puede seguir desplazándose con la rueda detrás del diálogo. `<dialog>` no bloquea el scroll.
- `Sheet` no se arrastra para cerrarse. Se cierra con el fondo, con su botón o con el botón atrás.
- La librería no conoce las zonas seguras del dispositivo (ADR-039): `Sheet` deja en nativo un margen inferior fijo, y en web usa `env(safe-area-inset-bottom)`.
- La lista de `Select` en nativo (ADR-038) puede pasar a usar esta base sin cambiar su API.
