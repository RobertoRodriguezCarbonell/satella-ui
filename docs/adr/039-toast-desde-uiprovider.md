# ADR-039: `Toast` se muestra con `useToast` y lo aloja `UIProvider`

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

Un toast es un aviso breve que aparece sobre la interfaz y desaparece solo: "Entradas enviadas", "No se ha podido guardar". A diferencia del resto del catálogo, no se coloca en el árbol donde ocurre la acción. Lo dispara un manejador de evento, a menudo después de una petición, y tiene que seguir visible aunque la pantalla que lo lanzó cambie.

Eso obliga a decidir tres cosas:

- Cómo se dispara: como componente (`<Toast open>`) o con una llamada (`toast.show(...)`).
- Quién guarda la cola de avisos y los pinta por encima de todo.
- Dónde vive la lógica de la cola y sus temporizadores, que es idéntica en web y en nativo.

CLAUDE.md §2 exige que una app no tenga que configurar nada más allá de importar `styles.css` y envolverse en `<UIProvider>`.

## Decisión

- **API imperativa.** `useToast()` devuelve `show(opciones)` y `dismiss(id)`. `show` devuelve el `id` del aviso.
- **`UIProvider` aloja los avisos.** Crea la cola y pinta la zona donde aparecen, pegada al borde inferior. Un `UIProvider` anidado, por ejemplo para cambiar de marca en una sección, reutiliza la cola del de fuera: solo hay una zona de avisos por app.
- **La cola vive en `core`** (`createToastStore`): alta, baja, cierre automático, pausa y límite de avisos visibles, sin React ni plataforma. Las vistas se suscriben con `useSyncExternalStore`.
- **Textos, solo los de la app.** El botón de cierre aparece si la app pasa `closeLabel`; la acción, si pasa `action` con su `label`. La librería no trae textos propios.

Comportamiento:

| Aspecto | Decisión |
|---|---|
| Duración | 5 segundos por defecto. `duration: 0` lo deja hasta que alguien lo cierre |
| Visibles a la vez | 3. Al llegar el cuarto, se retira el más antiguo |
| Pausa | En web, mientras el puntero o el foco están sobre los avisos |
| Lectores de pantalla | `danger` y `warning` interrumpen (`alert`); `success` e `info` esperan (`status`). En nativo se anuncian con `AccessibilityInfo` |
| Aspecto | Superficie elevada neutra con el icono del tono, para que se lea sobre cualquier contenido |

`Toast` no se exporta como componente: la única forma de mostrar uno es `useToast`.

## Alternativas descartadas

- **Componente declarativo (`<Toast open onOpenChange>`).** La app tendría que guardar un estado por cada aviso y mantenerlo montado, y un aviso lanzado desde una pantalla desaparecería al salir de ella.
- **Un `ToastProvider` aparte.** Es un segundo envoltorio que configurar, contra la regla de CLAUDE.md §2. Si no se pone, `useToast` no funciona y el fallo se descubre tarde.
- **Función global `toast()` sin contexto.** No sabría qué tema ni qué marca aplicar, y comparte estado entre árboles de React distintos y entre peticiones al renderizar en servidor.
- **Portal al `<body>` en web.** El `UIProvider` ya está en la raíz de la app y la zona de avisos es `position: fixed`: no hace falta sacarla del árbol, y dentro de él hereda las variables del tema.

## Consecuencias

- Mostrar un aviso es una línea, sin estado ni montaje en la app.
- En nativo, la zona de avisos se coloca respecto a la vista que contiene al `UIProvider`: tiene que ser la raíz de la app, que es donde ya se pone.
- La librería no conoce las zonas seguras del dispositivo (ADR-033 evita añadir dependencias nativas): la zona de avisos deja un margen inferior fijo. Si una app tiene una barra de pestañas, los avisos pueden taparla; una posición configurable queda para cuando haga falta.
- No hay animación de salida: el aviso se retira al instante. La de entrada respeta el movimiento reducido.
- Un aviso no debe ser la única vía para una información imprescindible: desaparece solo. Para eso está `Alert`.
