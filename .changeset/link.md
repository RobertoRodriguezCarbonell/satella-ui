---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

`Link`, un enlace de texto. Entra con madurez `experimental`.

- Dentro de un `Text` hereda su tipografía y fluye con el párrafo; fuera usa `body`. Con `variant` toma la tipografía de esa variante de `Text`.
- `color` acepta los colores de texto (por defecto `link`) y `underline` decide si se subraya siempre (`always`, por defecto) o solo al interactuar (`hover`).
- `onPress` se llama antes de navegar y puede cancelar la navegación con `event.preventDefault()`, para hacerla con el router de la app. En web no se llama si el clic lleva un modificador.
- En web es un `<a>`; con `target="_blank"` añade `rel="noopener noreferrer"`. En nativo abre el destino con `Linking`.
- `core` publica el contrato `LinkProps`, el tipo `LinkPressEvent`, la constante `linkUnderlines` y el hook `useLink`.
