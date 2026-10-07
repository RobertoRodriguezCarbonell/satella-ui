# ADR-026: Regla de entrada y niveles de madurez del catálogo

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Sin un criterio, la librería se convierte en el cajón de sastre de todo lo que cualquier app necesita, y los componentes nuevos quedan sujetos a semver completo antes de que su API se haya probado.

## Decisión

**Regla de entrada:** un componente entra en la librería cuando **se necesita en al menos dos apps** o es una **primitiva de base** (`Box`, `Stack`, `Text`, `Icon`…). Lo que solo necesita una app vive en esa app.

**Niveles de madurez**, declarados en el componente (`meta.parameters.maturity` en sus historias) y visibles como etiqueta en Storybook:

| Nivel | Significado | Garantía de API |
|---|---|---|
| `experimental` | Recién creado, en uso en una sola app | Puede cambiar en cualquier `minor` |
| `stable` | En producción en 2+ apps, checklist completa (ADR-018) | Semver completo (ADR-021, ADR-025) |
| `deprecated` | Sustituido, pendiente de eliminar | Se elimina en la siguiente `major` |

Todo componente nuevo entra como `experimental`. El paso a `stable` es un changeset `minor` explícito.

**Catálogo inicial** (orden en ROADMAP Fase 2 y Fase 5): fundamentos → acciones → formularios → feedback → superficies. Los componentes de dominio (tablas de datos, calendarios, editores) se evalúan cuando el núcleo sea `stable`.

**Mantenimiento recurrente:**

- Renovate/Dependabot con agrupación semanal; `react` y `react-native` se actualizan a mano (ADR-024).
- Revisión **trimestral**: deprecaciones pendientes de eliminar, ventana de versiones soportadas, informe de tamaño de bundle, ADR que hayan quedado obsoletos.
- La documentación vive junto al código: MDX en Storybook, `CHANGELOG.md` y `docs/adr/`. No se mantiene una wiki aparte.

## Alternativas descartadas

- **Sin regla de entrada.** Crecimiento descontrolado y componentes de un solo uso que nadie mantiene.
- **Todo `stable` desde el primer día.** Obliga a acertar la API a la primera o a pagar una `major` por cada ajuste.

## Consecuencias

- Se pueden publicar componentes nuevos sin comprometerse con su API.
- Las apps saben, por la etiqueta, cuánto pueden confiar en cada componente.
- La revisión trimestral mantiene la librería sana sin convertirse en una carga continua.
