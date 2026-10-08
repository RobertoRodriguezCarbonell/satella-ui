# @satellatickets/tokens

## 0.1.0

### Minor Changes

- [`4fb80d4`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4fb80d4d0bcaf590018fb59000d7b2c273d11ca3) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Primera versión de los tokens (Fase 1 del ROADMAP), con la identidad real de Satella: paleta y escalas primitivas (`space`, `radius`, `font` con Unbounded, Hanken Grotesk e IBM Plex Mono, `shadow` con resplandor de acento, `duration`, `zIndex`), capa semántica de color para el tema oscuro del producto y un tema claro equivalente (`color.bg.*`, `color.text.*`, `color.border.*`, `color.action.*`, `color.accent.*`, `color.feedback.*`), y las marcas `admin` y `organizer`. Formato DTCG 2025.10 y build con Style Dictionary v5 que genera `tokens.css` (bloques por tema y marca), `themes.ts` para React Native y los tipos `Theme`, `TokenName` y `BrandName`. Incluye tests de esquema DTCG, completitud entre temas y marcas, y contraste WCAG AA.

- [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Dos escalas nuevas para los controles: `size.control.{sm,md,lg}` (altura de botones y campos: 36, 44 y 52 px; en web, en rem) y `borderWidth.{thin,thick}` (1 y 2 px; `thick` es el anillo de foco). Los componentes las usan en lugar de valores literales.

### Patch Changes

- [`c4e9138`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/c4e9138ab13505b37bb26e55c22e1aa6314a8cf9) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Esqueleto inicial del monorepo (Fase 0 del ROADMAP): build con tsdown, TypeScript estricto, ESLint con reglas de fronteras entre capas, Vitest, Changesets y CI. Los paquetes todavía no exponen API pública.

- [`a9427c9`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a9427c967d87af04498fe7f90dea80abd8c01a06) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Los tres paquetes incluyen el fichero de licencia MIT. `ui` incluye además `NOTICE.md`, con la licencia ISC de los iconos de Lucide que lleva dentro.
