# ADR-041: El build web lleva `"use client"` y `core` separa lo que necesita el cliente

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-019 nombra a Next.js como el consumidor web de la librería, pero el consumo solo se probaba con Vite. Al instalar la `0.2.0` en una app Next.js 16 con App Router y usar un componente desde una página, `next build` falla:

```
TypeError: (0 , b.createContext) is not a function
  at module evaluation (app/layout.tsx:2:1)
> 2 | import { UIProvider } from '@satellatickets/ui';
```

En la App Router, las páginas y los layouts son Server Components. React les da una versión recortada de sí mismo, sin `createContext`, sin estado y sin efectos. Un módulo que usa esas piezas tiene que declararse Client Component con la directiva `"use client"` en su primera línea; sin ella, Next.js lo evalúa en el servidor y falla.

Los paquetes se publican como un bundle por plataforma, y ninguno llevaba la directiva. Dos de ellos la necesitan de forma distinta:

- `ui`: todos sus componentes usan hooks, contexto o manejadores de eventos.
- `core`: mezcla contextos y hooks, que solo existen en el cliente, con constantes y funciones puras (`buttonVariants`, `resolveTheme`, `getTabInDirection`…) que una app puede querer leer en el servidor.

## Decisión

- **`ui`:** el build web entero lleva `"use client"`. El build nativo no: Metro no la necesita.
- **`core`:** se publica en dos ficheros. `dist/client.js` reúne los contextos y los hooks y lleva `"use client"`. `dist/index.js` contiene el código puro, no importa React y reexporta `client.js`. La API pública sigue siendo una sola: todo se importa de `@satellatickets/core`.
- En el código fuente, la frontera es `packages/core/src/client.ts`. Lo que use `createContext` o un hook se exporta desde ahí; lo demás, desde `index.ts`.
- `tokens` no cambia: no depende de React.
- `pnpm check:packages` construye una app Next.js externa (`tests/consumer-next`) que usa los componentes y las constantes de `core` desde un Server Component, y comprueba que las directivas están en los ficheros que tocan.

## Alternativas descartadas

- **Que cada app envuelva los componentes en ficheros propios con `"use client"`.** Es lo que obliga a hacer la `0.2.0`. Traslada a cada app un trabajo repetitivo que la librería puede hacer una vez.
- **`"use client"` en todo `core`.** Lo arregla igual, pero una constante importada desde un Server Component deja de ser un valor y pasa a ser una referencia al cliente: `buttonVariants.variant.map(...)` fallaría en el servidor sin un mensaje claro.
- **Un segundo punto de entrada, `@satellatickets/core/client`.** Deja la frontera a la vista, pero cambia de dónde se importan los hooks, que es un breaking change, y `ui` ya los reexporta.
- **Publicar un fichero por módulo, con la directiva solo donde hace falta.** Permitiría que `Box`, `Stack` o `Text` fueran Server Components y no enviaran JavaScript al navegador. Es una optimización real, pero cambia la forma del paquete entero. Se puede hacer después sin cambiar la API.

## Consecuencias

- Una app Next.js usa la librería como cualquier otra: importa `styles.css` y `UIProvider` en su layout y los componentes en sus páginas, sin envoltorios.
- Todos los componentes son Client Components. Se renderizan también en el servidor, así que el HTML llega completo, pero su código viaja al navegador, también el de los que no tienen interacción.
- Desde un Server Component no se pueden pasar funciones a un componente: `onPress`, `onChangeText` y demás manejadores exigen que el componente que los define sea a su vez un Client Component. Es una regla de React, no de la librería.
- Añadir a `core` algo que use React obliga a exportarlo desde `client.ts`. Si se exporta desde `index.ts`, `check:packages` falla porque `index.js` importaría React.
- Los bundlers que no conocen la directiva (Vite, Metro, esbuild) la ignoran.
