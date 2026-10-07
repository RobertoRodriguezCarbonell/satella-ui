# ADR-021: Versionado semántico con Changesets y fase `0.x`

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Varias apps consumirán la librería y cada una decidirá cuándo actualizar. Necesitan saber, por el número de versión, si una actualización es segura. También hace falta que el versionado no dependa de pasos manuales.

## Decisión

**Semver** interpretado para una librería de UI:

| Cambio | Tipo |
|---|---|
| Corrección sin cambiar API ni aspecto (foco, padding interno invisible) | `patch` |
| Componente, variante o prop opcional nueva; cambio visual visible que no altera layout | `minor` |
| Ver lista de breaking changes en ADR-025 | `major` |

**Changesets** como flujo:

1. Cada cambio termina con `pnpm changeset`, que genera un `.md` en `.changeset/` con paquetes afectados, tipo y descripción. Se commitea con el código. **Sin changeset, el cambio no se publica.**
2. Al mergear a `main`, la action de Changesets acumula los pendientes en una PR "Version Packages" que sube versiones y escribe los `CHANGELOG.md`.
3. Mergear esa PR publica (ADR-022).

**Fase `0.x`:** hasta que la librería esté en producción en al menos una app, las versiones son `0.x.y`. En semver, `0.x` significa "la API puede cambiar": los breaking changes se publican como `minor`. El salto a `1.0.0` se hace cuando la API lleve un ciclo estable en producción.

Las descripciones de los changesets se escriben pensando en quien lee el CHANGELOG desde una app: qué cambia y, si es breaking, cómo migrar.

## Alternativas descartadas

- **Versionado manual.** Se olvida, se hace mal, y no genera changelog.
- **semantic-release (versión inferida de los commits).** Funciona bien en un solo paquete; en un monorepo con varios paquetes publicados, Changesets maneja mejor las dependencias cruzadas.
- **Versión única para todos los paquetes (fixed mode).** Simplifica, pero obliga a publicar `tokens` cada vez que cambia `ui`. Se usa modo independiente.

## Consecuencias

- Cero intervención manual en números de versión y changelogs.
- Claude Code debe crear un changeset al final de cada tarea (CLAUDE.md §10).
- En `0.x`, las apps deben fijar versiones exactas o `~0.x.y` y leer el CHANGELOG al actualizar.
