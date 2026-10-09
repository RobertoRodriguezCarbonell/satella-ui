# ROADMAP — satella-ui

Plan de arranque y crecimiento de la librería. Cada fase termina con la CI en verde y con sus changesets creados. No se empieza una fase sin cerrar la anterior.

Las reglas de implementación están en `CLAUDE.md`; las decisiones razonadas, en `docs/adr/`.

---

## Fase 0 — Esqueleto del monorepo

**Objetivo:** un repositorio vacío pero completamente operativo, con todas las herramientas configuradas y la CI pasando con paquetes vacíos.

Entregables:

- `pnpm-workspace.yaml`, `turbo.json`, `package.json` raíz con los scripts de `CLAUDE.md` §9.
- `tooling/tsconfig` (base, react, react-native), `tooling/eslint-config` con las reglas de fronteras entre capas (ADR-002), `tooling/prettier-config`.
- `packages/tokens`, `packages/core`, `packages/icons`, `packages/ui` creados con `package.json`, `tsdown.config.ts` y un `index.ts` vacío.
- `.changeset/` inicializado con `config.json` (los paquetes de `apps/` en `ignore`).
- `.github/workflows/ci.yml` (lint → typecheck → test → build) y `release.yml` (action de Changesets), aunque aún no publique nada.
- Hook de pre-commit con lint y typecheck de los ficheros cambiados.
- Renovate/Dependabot configurado con agrupación semanal; `react` y `react-native` excluidos de la actualización automática.

**Hecho cuando:** `pnpm install && pnpm lint && pnpm typecheck && pnpm build && pnpm test` pasan en local y en CI.

---

## Fase 1 — Tokens

**Objetivo:** el paquete `@satellatickets/tokens` genera las salidas para ambas plataformas a partir de ficheros DTCG.

Entregables:

- Primitivos en `src/primitives/`: `color`, `space`, `radius`, `typography` (familias, tamaños, pesos, alturas de línea), `shadow`, `duration`, `z-index`.
- Semánticos en `src/semantic/light.tokens.json` y `dark.tokens.json`: `color.bg.*`, `color.text.*`, `color.border.*`, `color.action.*`, `color.feedback.*` (success, warning, danger, info).
- `src/brands/` creado (vacío o con una marca de ejemplo).
- `build.ts` con Style Dictionary v5 generando `dist/web/tokens.css` (bloques `:root`/`[data-theme]`/`[data-brand]`), `dist/native/themes.ts` y `dist/types.ts`.
- Tests: completitud (todo tema/marca define todos los semánticos) y contraste WCAG AA para las parejas texto/fondo declaradas.
- Modo watch integrado en `pnpm dev`.

**Hecho cuando:** `dist/` se genera, los tipos se exportan y los tests pasan.

---

## Fase 2 — Fundamentos y Storybooks

**Objetivo:** las primitivas que hacen posibles las historias multiplataforma, visibles en ambos Storybooks.

Entregables:

- `UIProvider` con la misma API en web y nativo: `theme` (`light` | `dark` | `system`), `brand`. En web pone `data-theme`/`data-brand`; en nativo entrega el tema por contexto. Hook `useTheme()`.
- `Box`, `Stack` (dirección, `gap`, alineación), `Text` (variantes tipográficas), `Icon`.
- `packages/ui/src/_storybook/types.{web,native}.ts`.
- `apps/storybook-web`: `@storybook/react-vite`, resolución de `.web.tsx`, decorador global con `UIProvider`, selector de tema en la toolbar, addons Controls, Actions, Docs, A11y.
- `apps/storybook-native`: app Expo SDK 56 con `@storybook/react-native`, decorador global, selector de tema.
- Build de `ui` configurado: doble build (web/nativo), `exports` condicionales, `styles.css`, `sideEffects`, peers opcionales (ADR-019).

**Hecho cuando:** los fundamentos se ven en navegador y en simulador/dispositivo, en ambos temas, y las historias son las mismas en los dos Storybooks.

---

## Fase 3 — Componente de referencia: `Button`

**Objetivo:** un componente que cumple la checklist completa y fija el patrón que copiará todo lo demás. Es la fase más importante: aquí se invierte el tiempo en hacerlo bien.

Entregables:

- Contrato en `core`: `buttonVariants` (`variant`: primary, secondary, ghost, danger; `size`: sm, md, lg), `ButtonProps`, hook `useButton` si aplica.
- Vistas web y nativa con mapas exhaustivos de variantes.
- Estados: default, hover/pressed, focus visible, `disabled`, `loading` (con `Spinner` mínimo), con icono.
- Historias con funciones `play` (click dispara `onPress`, `disabled` no dispara, `loading` no dispara).
- Tests nativos equivalentes con RNTL.
- Vitest en modo navegador configurado con el addon de Storybook, a11y bloqueante y `toMatchScreenshot`. Referencias generadas en CI.
- `README.mdx` documentando el patrón para futuros componentes.

**Hecho cuando:** toda la checklist de `CLAUDE.md` §8 está cumplida y la CI ejecuta interacción, a11y, visual y nativo en verde.

---

## Fase 4 — Primera publicación

**Objetivo:** `0.1.0` en npm y Storybook público.

Entregables:

- Organización `satellatickets` creada en npm; paquetes `@satellatickets/tokens`, `@satellatickets/core`, `@satellatickets/ui` publicados por primera vez.
- Trusted publishing (OIDC) configurado en npm para `release.yml`; `provenance` activado; `publint` en CI.
- Storybook web desplegado como sitio estático en cada push a `main`.
- `apps/playground-web` y `apps/playground-native` consumiendo `@satellatickets/ui` con `workspace:*`.
- Prueba de integración real: `pnpm pack` e instalación del `.tgz` en una app externa web y, si existe, en una app React Native.

**Hecho cuando:** una app real externa al monorepo renderiza `Button` desde el paquete publicado.

---

## Fase 5 — Catálogo

**Objetivo:** construir el catálogo inicial, componente a componente, cada uno con su checklist y su changeset. Todo componente nuevo entra como `experimental` y pasa a `stable` cuando está en producción en dos apps con tests completos (ADR-026).

Orden:

| Grupo | Componentes |
|---|---|
| 5.1 Acciones | `IconButton`, `Link` |
| 5.2 Formularios | `Input`, `TextArea`, `Checkbox`, `Switch`, `Select`, `FormField` (label + ayuda + error) |
| 5.3 Feedback | `Spinner` (completo), `Skeleton`, `Badge`, `Alert`, `Toast` |
| 5.4 Superficies | `Card`, `Divider`, `Modal` / `Sheet`, `Tabs` |

Componentes de dominio (tablas de datos, calendarios, editores…) se evalúan después, cuando el núcleo sea `stable`.

---

## Fase 6 — Lista para adoptar

**Objetivo:** que una app real pueda adoptar el paquete publicado sin apaños, en los tres entornos que la librería promete: Next.js, una app React con Vite y Expo. Es el paso previo a que los componentes puedan pasar a `stable`, que exige estar en producción en dos apps (ADR-026).

Nace de un dato: la `0.2.0` falla al importarse desde un Server Component de Next.js, y hasta ahora solo se probaba el consumo con Vite.

Entregables:

- Compatibilidad con los Server Components de Next.js: el build web lleva `"use client"` y las constantes de `core` se pueden leer en el servidor (ADR-041).
- `pnpm check:packages` prueba el consumo en tres apps externas al monorepo: Vite, Next.js con App Router y Expo empaquetada con Metro.
- Guía de adopción en `docs/adopcion.md`: instalación, estilos, `UIProvider`, fuentes, Next.js, Expo, navegación con `Link`, formularios y avisos.
- `apps/playground-web` y `apps/playground-native` ejercitan el catálogo con un flujo real de compra, no con una sola tarjeta.
- Alertas de seguridad de dependencias revisadas.

**Hecho cuando:** las tres apps externas se construyen en CI a partir de los paquetes empaquetados y la versión que lo corrige está publicada.

---

## Hitos posteriores (no planificados aún)

- Salto a `1.0.0` cuando la API lleve un ciclo estable en producción.
- Separar `@satellatickets/icons` como paquete propio cuando el catálogo de iconos crezca.
- Regresión visual nativa (requiere simuladores en CI) cuando haya un número significativo de componentes en producción.
- Reevaluar Unistyles para las vistas nativas si el rendimiento del cambio de tema lo justifica.
- Migración a registro privado (GitHub Packages) si se decide cerrar la librería.
