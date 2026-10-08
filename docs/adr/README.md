# Architecture Decision Records

Cada decisión de arquitectura relevante se registra en un fichero numerado. Un ADR se escribe **antes** de implementar la decisión y no se edita una vez aceptado: si una decisión cambia, se crea un ADR nuevo que marca al anterior como *superseded*.

## Índice

| Nº | Título | Estado |
|---|---|---|
| [001](001-arquitectura-hibrida.md) | Librería compartida React + React Native con arquitectura híbrida | Aceptado |
| [002](002-capas-y-dependencias.md) | Capas `tokens → core → ui` y reglas de dependencia | Aceptado |
| [003](003-monorepo-pnpm-turborepo-changesets.md) | Monorepo con pnpm workspaces, Turborepo y Changesets | Aceptado |
| [004](004-convencion-por-componente.md) | Convención de ficheros por componente y resolución por plataforma | Aceptado |
| [005](005-tokens-tres-niveles.md) | Tokens en tres niveles: primitivos, semánticos, de componente | Aceptado |
| [006](006-dtcg-style-dictionary.md) | Formato DTCG 2025.10 y Style Dictionary v5 | Aceptado |
| [007](007-estilos-web-css-modules.md) | Estilos web con CSS Modules y variables CSS | Aceptado |
| [008](008-estilos-nativo-stylesheet.md) | Estilos nativos con `StyleSheet` y `ThemeProvider` propio | Aceptado |
| [009](009-variantes-contrato-en-core.md) | Variantes como contrato tipado definido en `core` | Aceptado |
| [010](010-uiprovider.md) | `UIProvider` con API única para tema y marca | Aceptado |
| [011](011-dos-storybooks.md) | Dos Storybooks: react-vite para web y react-native en Expo | Aceptado |
| [012](012-historias-compartidas.md) | Historias compartidas en CSF con reglas multiplataforma | Aceptado |
| [013](013-decorador-y-addons.md) | Decorador global de tema y addons iniciales | Aceptado |
| [014](014-typescript-estricto-paridad.md) | TypeScript estricto y mapas exhaustivos para garantizar paridad | Aceptado |
| [015](015-vitest-core-tokens.md) | Vitest para `core`, `tokens` y web; tests de completitud y contraste | Aceptado |
| [016](016-historias-como-tests-web.md) | Las historias son los tests web: interacción, a11y y regresión visual | Aceptado |
| [017](017-jest-rntl-nativo.md) | Jest + React Native Testing Library para las vistas nativas | Aceptado |
| [018](018-checklist-componente-terminado.md) | Checklist de "componente terminado" | Aceptado |
| [019](019-build-tsdown-exports.md) | Build con tsdown, doble salida y conditional exports | Aceptado |
| [020](020-paquetes-publicados.md) | Paquetes publicados: `tokens`, `core`, `ui`; `icons` interno | Aceptado |
| [021](021-versionado-changesets.md) | Versionado semántico con Changesets y fase `0.x` | Aceptado |
| [022](022-ci-cd.md) | CI/CD con GitHub Actions, publint y trusted publishing | Aceptado |
| [023](023-publicacion-publica.md) | Publicación pública en npm bajo `@satellatickets` | Aceptado |
| [024](024-versiones-minimas.md) | Versiones mínimas soportadas y ventana de soporte | Aceptado |
| [025](025-deprecacion-y-breaking-changes.md) | Política de deprecación y definición de breaking change | Aceptado |
| [026](026-crecimiento-del-catalogo.md) | Regla de entrada y niveles de madurez del catálogo | Aceptado |
| [027](027-fuentes-nombradas-cargadas-por-la-app.md) | Las fuentes se nombran en los tokens y las carga la app | Aceptado |
| [028](028-icons-como-datos-y-react-native-svg.md) | `icons` como paquete de datos y `react-native-svg` como peer opcional | Aceptado |
| [029](029-marcas-con-overrides-por-tema.md) | Marcas con overrides comunes y por tema | Aceptado |
| [030](030-tests-de-historias-y-referencias-visuales.md) | Tests de historias en `storybook-web`, dos temas y referencias visuales junto al componente | Aceptado |
| [031](031-publicacion-arranque-y-release-por-jobs.md) | Publicación: arranque manual, release por jobs y comprobación de paquetes | Aceptado |
| [032](032-tipos-de-props-por-plataforma.md) | Los tipos de props de cada plataforma se exportan desde su vista | Aceptado |
| [033](033-react-native-svg-no-se-instala-solo.md) | `react-native-svg` no se instala automáticamente | Aceptado |

## Plantilla

```markdown
# ADR-NNN: Título

**Estado:** Propuesto | Aceptado | Superseded por ADR-MMM
**Fecha:** AAAA-MM-DD

## Contexto
Qué problema o pregunta motiva la decisión.

## Decisión
Qué se decide, de forma concreta y verificable.

## Alternativas descartadas
Qué otras opciones se consideraron y por qué no.

## Consecuencias
Qué implica la decisión: ventajas, costes, qué queda abierto.
```
