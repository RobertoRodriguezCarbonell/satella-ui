# ADR-044: `Modal` y `Sheet` bloquean el desplazamiento de la página en web

**Estado:** Aceptado
**Fecha:** 2026-10-09

## Contexto

ADR-040 dejó anotada una limitación: un `<dialog>` abierto con `showModal()` deja inerte el resto de la página, pero no impide desplazarla. Con el diálogo delante, la rueda del ratón y el dedo siguen moviendo lo de detrás. Se nota sobre todo con `Sheet`, que en un móvil se usa con el pulgar justo donde está el contenido de la página.

En nativo no ocurre: el `Modal` de React Native es una ventana aparte.

## Decisión

Mientras un `Modal` o un `Sheet` está en pantalla, la vista web pone `overflow: hidden` en el elemento raíz del documento, y lo devuelve a como estaba cuando el último diálogo desaparece.

- **Sin saltos.** Si la barra de desplazamiento ocupa sitio (Windows, Linux, un ratón conectado en macOS), al quitarla la página ganaría ese ancho y todo se movería unos píxeles. Se compensa con un relleno a la derecha del mismo ancho.
- **Varios diálogos.** Se cuentan: la página vuelve a desplazarse al cerrarse el último.
- **Se restaura lo que había**, no un valor por defecto: si la app ya tenía `overflow` o `padding-right` en línea en la raíz, vuelven.

## Alternativas descartadas

- **Solo CSS: `html:has(dialog:modal) { overflow: hidden }`.** Sin JavaScript y sin estado que limpiar, pero no puede saber cuánto mide la barra para compensarla. `scrollbar-gutter: stable` reserva el hueco siempre, también en una página corta que no tenía barra, y entonces el salto lo provoca el propio arreglo.
- **Cancelar los eventos de rueda y de toque.** Hay que distinguir el desplazamiento de la página del de un contenido largo dentro del diálogo, que sí debe moverse. Es frágil.
- **Dejarlo en manos de la app.** Todas las apps lo quieren, y todas lo harían igual.

## Consecuencias

- La librería modifica el estilo en línea del elemento raíz mientras hay un diálogo abierto. Una app que cambie `overflow` o `padding-right` de la raíz en ese intervalo verá su cambio deshecho al cerrarse.
- Solo bloquea el desplazamiento del documento. Si la app desplaza un contenedor propio, sigue moviéndose.
- Los elementos con `position: fixed` de la app (una cabecera) no reciben el relleno: con barra clásica se ensanchan lo que mide la barra mientras el diálogo está abierto.
- La lista de `Select` no bloquea nada: no es modal, y sigue al campo si la página se desplaza (ADR-042).
