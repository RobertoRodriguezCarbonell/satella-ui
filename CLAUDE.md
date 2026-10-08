# satella-ui — Guía para Claude Code

Librería de componentes de UI compartida entre aplicaciones **React (web)** y **React Native**, publicada en npm bajo el scope `@satellatickets`. Este fichero contiene las reglas que gobiernan todo el código del repositorio. Las decisiones de fondo están razonadas en `docs/adr/`; el plan de trabajo está en `ROADMAP.md`.

**Regla general:** ante cualquier duda de diseño, consultar primero el ADR correspondiente. Si una decisión nueva no está cubierta por ningún ADR, proponer uno nuevo (plantilla en `docs/adr/README.md`) antes de implementar.

---

## 1. Qué es este proyecto

- Un **design system en código**: tokens de diseño + componentes con una API única que funciona igual en web y en móvil.
- Arquitectura **híbrida** (ADR-001): tokens, tipos, contratos de props y lógica headless se comparten al 100 %; el renderizado es específico por plataforma detrás de una sola importación.
- Las apps consumidoras hacen `import { Button } from '@satellatickets/ui'` y el bundler de cada plataforma resuelve la implementación correcta.

## 2. Stack y versiones

| Herramienta | Versión / decisión | ADR |
|---|---|---|
| Node | 22 LTS (desarrollo) | 024 |
| Gestor de paquetes | pnpm (workspaces) | 003 |
| Orquestación | Turborepo | 003 |
| Versionado | Changesets | 003, 021 |
| TypeScript | 5.x, modo `strict` | 014 |
| React / React DOM | peer `>=19.0`, desarrollo con 19.2 | 024 |
| React Native | peer `>=0.81`, Nueva Arquitectura únicamente, desarrollo con 0.86 | 024, 034 |
| Expo (apps internas) | SDK 57 | 024, 034 |
| Tokens | DTCG 2025.10 + Style Dictionary v5 | 006 |
| Estilos web | CSS Modules + variables CSS | 007 |
| Estilos nativo | `StyleSheet` de React Native + `ThemeProvider` propio | 008 |
| Catálogo | Storybook: `@storybook/react-vite` (web) y `@storybook/react-native` en Expo (nativo) | 011 |
| Tests | Vitest (core, tokens, ui-web en navegador) y Jest + RNTL (ui-nativo) | 015–017 |
| Bundler | tsdown | 019 |
| CI/CD | GitHub Actions, trusted publishing en npm, `main` protegida por la CI | 022, 035 |

**Prohibido** introducir dependencias de estilos en tiempo de ejecución (CSS-in-JS, NativeWind, Unistyles, Tamagui…) sin un ADR que lo justifique. Las apps consumidoras no deben necesitar configurar nada más allá de importar `styles.css` (web) y envolverse en `<UIProvider>`.

## 3. Estructura del repositorio

```
satella-ui/
├── apps/
│   ├── storybook-web/        # Catálogo en navegador. Resuelve *.web.tsx
│   ├── storybook-native/     # App Expo con Storybook on-device. Resuelve *.native.tsx
│   ├── playground-web/       # App mínima que consume @satellatickets/ui (workspace:*)
│   └── playground-native/    # App Expo mínima que consume @satellatickets/ui
├── packages/
│   ├── tokens/               # @satellatickets/tokens — publicado
│   │   ├── src/primitives/   # *.tokens.json (paleta en bruto)
│   │   ├── src/semantic/     # light.tokens.json, dark.tokens.json
│   │   ├── src/brands/       # overrides por marca (puede estar vacío)
│   │   ├── build.ts          # Style Dictionary
│   │   └── dist/             # generado: web/tokens.css, native/themes.ts, types.ts
│   ├── core/                 # @satellatickets/core — publicado. Hooks headless, tipos, variantes
│   ├── icons/                # interno, se incluye dentro de ui
│   └── ui/                   # @satellatickets/ui — publicado. Componentes
│       └── src/<componente>/
├── tooling/
│   ├── tsconfig/
│   ├── eslint-config/        # incluye las reglas de fronteras entre capas
│   └── prettier-config/
├── docs/adr/                 # decisiones de arquitectura
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
├── CLAUDE.md
└── ROADMAP.md
```

## 4. Capas y reglas de dependencia (ADR-002)

```
tokens  →  core  →  ui  →  apps
                    ↑
                  icons
```

- Cada paquete **solo importa de los que están a su izquierda**.
- `core` **nunca** importa `react-dom`, `react-native`, ni nada específico de plataforma. Solo `react` y TypeScript puro.
- `tokens` no importa nada de React.
- `ui` es el único paquete con ficheros `.web.tsx` / `.native.tsx`.
- Estas reglas están impuestas por ESLint (`tooling/eslint-config`). Un import prohibido debe fallar en lint, no en revisión.

## 5. Convención por componente (ADR-004)

Cada componente vive en `packages/ui/src/<nombre>/` con esta estructura. Todos los ficheros son obligatorios salvo que se indique:

```
button/
├── Button.types.ts        # re-exporta/extiende el contrato definido en core
├── Button.web.tsx         # vista web: HTML semántico + CSS Modules
├── Button.module.css      # estilos web, solo variables CSS de tokens
├── Button.native.tsx      # vista React Native: StyleSheet + useTheme()
├── Button.stories.tsx     # historias compartidas (CSF)
├── Button.web.stories.tsx # (opcional) historias solo web, p. ej. hover
├── Button.native.test.tsx # tests nativos con RNTL, reutilizando args de las historias
├── README.mdx             # (opcional) documentación extra para Storybook
└── index.ts               # export público
```

Reglas:

- El **contrato** (props y variantes) se define **una sola vez** en `packages/core/src/types/<nombre>.ts` (ADR-009). Las vistas lo importan; nunca lo redefinen.
- Cada vista declara sus estilos como **mapa exhaustivo** de las variantes del contrato con `satisfies Record<Variant, …>` (ADR-014). Añadir una variante en `core` debe romper la compilación hasta que ambas vistas la implementen.
- Los componentes consumen **solo tokens semánticos** (`color.bg.surface`, `space.4`…), nunca primitivos (`blue.600`) ni valores literales (ADR-005).
- Texto como `children` debe funcionar en ambas plataformas: la vista nativa envuelve el texto en `<Text>` internamente.
- Accesibilidad desde el diseño: HTML semántico + ARIA en web; `accessibilityRole`, `accessibilityLabel`, `accessibilityState` en nativo.
- Nada específico de un cliente o de un producto concreto dentro de la librería. Eso vive en la app.

## 6. Historias (ADR-012, ADR-013)

- Las historias se escriben **una vez** y las leen ambos Storybooks.
- Dentro de una historia **solo se usan componentes de la librería** (`Stack`, `Box`, `Text`…). Nunca `div`, `span`, `View` ni `Text` de React Native.
- Los tipos de Storybook se importan desde `packages/ui/src/_storybook/types` (tiene versión `.web.ts` y `.native.ts`).
- `argTypes` toma las opciones de las constantes de variantes de `core`, no de listas escritas a mano.
- Cada componente tiene como mínimo: una historia por variante/estado relevante, una matriz `AllVariants`, y funciones `play` para las interacciones (ADR-016).

## 7. Flujo para un componente nuevo

1. **Contrato** en `core`: tipos, constantes de variantes y, si hay lógica, el hook headless con sus tests unitarios.
2. **Historias**: todos los estados que debe soportar, antes de implementar nada.
3. **Vista web** hasta que todas las historias se vean correctas en `storybook-web`.
4. **Vista nativa** hasta que se vean correctas en `storybook-native`.
5. **Tests**: funciones `play`, tests nativos, referencias visuales.
6. **Revisión**: panel A11y sin violaciones, ambos temas, ambos Storybooks.
7. **Changeset** (`pnpm changeset`) describiendo el cambio. Un componente nuevo es `minor` y entra con madurez `experimental` (ADR-026).

`Button` es el **componente de referencia**: ante cualquier duda de estructura o estilo, hacer lo mismo que `Button`.

## 8. Checklist de "componente terminado" (ADR-018)

Un componente no está terminado hasta cumplir **todos** los puntos:

- [ ] Contrato tipado en `core`, con variantes exhaustivas en ambas vistas (`satisfies Record<…>`)
- [ ] Historias de todos los estados, incluidos `disabled`, `loading` y error cuando apliquen
- [ ] Función `play` para cada interacción relevante
- [ ] Cero violaciones de accesibilidad en todas las historias (a11y es bloqueante)
- [ ] Tests nativos con React Native Testing Library para las mismas interacciones
- [ ] Referencias visuales generadas en CI y revisadas
- [ ] Verificado en tema claro y oscuro, en Storybook web y nativo
- [ ] Exportado desde `packages/ui/src/index.ts`
- [ ] Changeset creado
- [ ] CI en verde

## 9. Comandos

```bash
pnpm install                 # instala todo el monorepo
pnpm dev                     # tokens en watch + storybook-web
pnpm dev:native              # storybook-native (Expo)
pnpm build                   # build de todos los paquetes (Turborepo)
pnpm test                    # todos los tests
pnpm test:web                # historias en navegador (Vitest browser mode)
pnpm test:native             # Jest + RNTL
pnpm lint && pnpm typecheck
pnpm changeset               # registrar un cambio
pnpm pack --filter @satellatickets/ui   # .tgz para probar en una app externa
```

## 10. Versionado y cambios (ADR-021, ADR-025)

- **Cada tarea termina con un changeset.** Sin changeset, el cambio no se publica.
- Fase `0.x` hasta que la librería esté en producción en al menos una app: los breaking changes se publican como `minor`.
- Un **cambio visual visible** es como mínimo `minor`; si altera tamaño o posición de un componente, es breaking.
- Son **breaking**: cambiar/eliminar una prop, variante o valor por defecto; cambiar el HTML renderizado en web; cambiar tamaño/posición; renombrar o eliminar un token semántico; subir versiones mínimas de peers.
- **Deprecación en tres pasos**: marcar con `@deprecated` (JSDoc) + `console.warn` una sola vez en desarrollo indicando la alternativa → convivir al menos una `minor` → eliminar solo en la siguiente `major`, con migración documentada en el CHANGELOG y codemod si afecta a muchas llamadas.

## 11. Qué no hacer

- No añadir componentes que solo necesita una app (regla de entrada: dos apps o primitiva base, ADR-026).
- No usar `react-native-web` para la vista web: las vistas web son HTML y CSS reales.
- No empaquetar `react`, `react-dom` ni `react-native` dentro de los paquetes: son peer dependencies (ADR-019).
- No editar nada en `packages/tokens/dist/`: es generado.
- No generar referencias visuales en local: se generan en CI (ADR-016).
- No publicar a mano: la publicación la hace `release.yml` a través de Changesets (ADR-022).
- No llevar a `main` un commit sin la CI en verde: la rama está protegida y lo rechaza (ADR-035). Se sube la rama de trabajo, se espera a la CI y se avanza `main` a ese mismo commit.
- No eliminar nada deprecado fuera de una `major`.
