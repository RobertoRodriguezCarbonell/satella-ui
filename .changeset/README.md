# Changesets

Cada tarea termina con un changeset (`pnpm changeset`), que genera aquí un `.md` con los paquetes afectados, el tipo de cambio (`patch` | `minor` | `major`) y una descripción escrita para quien lee el `CHANGELOG` desde una app. **Sin changeset, el cambio no se publica** (ADR-021).

- Qué tipo poner: tabla de ADR-021 y lista de breaking changes de ADR-025. Mientras la librería esté en `0.x`, los breaking changes se publican como `minor`.
- Los paquetes privados (`@satellatickets/icons`, las apps de `apps/`) no se versionan ni se publican: `privatePackages` está desactivado en `config.json`.
- Al mergear a `main`, `release.yml` acumula los changesets pendientes en la PR "Version Packages". Mergear esa PR sube versiones y escribe los `CHANGELOG.md` (y, a partir de la Fase 4, publica en npm).
