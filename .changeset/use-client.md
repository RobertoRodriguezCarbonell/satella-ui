---
'@satellatickets/ui': patch
'@satellatickets/core': patch
---

Los paquetes funcionan con los Server Components de Next.js (ADR-041). Hasta ahora, importar un componente desde una página o un layout de la App Router hacía fallar `next build` con `createContext is not a function`.

- `ui`: el build web lleva la directiva `"use client"`. Ya no hace falta envolver los componentes en ficheros propios.
- `core`: los contextos y los hooks se publican en un fichero aparte con `"use client"`, y el resto es código puro. Las constantes (`buttonVariants`, `textVariants`…) y las funciones puras (`resolveTheme`, `getTabInDirection`…) se pueden usar desde un Server Component. La API no cambia: todo se sigue importando de `@satellatickets/core`.
