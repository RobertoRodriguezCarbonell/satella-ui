# ADR-020: Paquetes publicados: `tokens`, `core`, `ui`; `icons` interno

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Hay cuatro paquetes en el monorepo (ADR-002). Hay que decidir cuáles son instalables por las apps y cuáles son detalles internos.

## Decisión

| Paquete | npm | Motivo |
|---|---|---|
| `@satellatickets/tokens` | Publicado | Útil por sí solo: emails, documentación, otros proyectos que no usen los componentes |
| `@satellatickets/core` | Publicado | Hooks headless y tipos reutilizables en apps que necesiten la lógica sin la vista |
| `@satellatickets/ui` | Publicado | El paquete principal |
| `@satellatickets/icons` | **Interno** (`private: true`), incluido dentro de `ui` | Pocos iconos al inicio; separarlo añadiría un paquete que mantener sin beneficio aún |

- `ui` depende de `core` y `tokens` como dependencias normales; Changesets sube las versiones de forma coherente cuando cambia una dependencia interna.
- `icons` se extraerá a paquete publicado cuando el catálogo de iconos crezca o una app lo necesite sin `ui` (hito en ROADMAP).

## Alternativas descartadas

- **Un único paquete `ui` con todo dentro.** Impide usar tokens o hooks sin arrastrar los componentes.
- **Cuatro paquetes publicados desde el inicio.** Más superficie de versionado y documentación sin demanda real.

## Consecuencias

- Las apps instalan `@satellatickets/ui`; `core` y `tokens` llegan como dependencias transitivas, pero pueden instalarse sueltos si hace falta.
- Tres `CHANGELOG.md` y tres paquetes con trusted publishing configurado (ADR-022).
