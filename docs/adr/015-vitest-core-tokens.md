# ADR-015: Vitest para `core`, `tokens` y web; tests de completitud y contraste

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

`core` contiene la lógica compartida por ambas plataformas; `tokens` contiene los datos de los que depende todo el aspecto visual. Ambos son baratos de probar y los errores en ellos se multiplican por cada componente y cada app.

## Decisión

**Vitest** como runner para todo el monorepo salvo los tests nativos (ADR-017).

**`core`:**
- Tests unitarios de cada hook y utilidad con `@testing-library/react` (`renderHook`).
- Objetivo de cobertura **~90 %**, exigido en CI.

**`tokens`:**
- **Completitud**: cada tema y cada marca define todos los tokens semánticos. Añadir `color.bg.overlay` al tema claro y olvidarlo en el oscuro hace fallar el test.
- **Contraste WCAG**: para cada pareja texto/fondo declarada en un fichero de parejas (`text.primary` sobre `bg.surface`, `text.onAction` sobre `action.primary`…), se calcula el ratio en todos los temas y marcas y se exige AA (4.5:1 para texto normal, 3:1 para texto grande y elementos de interfaz).
- Validación de que los JSON cumplen la especificación DTCG.

**`ui` web:** Vitest en modo navegador sobre las historias (ADR-016).

## Alternativas descartadas

- **Jest para todo.** Más lento, sin ESM nativo, y requiere transformadores para TypeScript. Jest se mantiene solo donde el ecosistema lo exige: React Native.
- **Sin tests de tokens.** Los temas divergen en silencio y el contraste insuficiente llega a producción.

## Consecuencias

- Vitest y Jest conviven en el monorepo con APIs casi idénticas; el cambio de contexto es mínimo.
- Los tests de `tokens` convierten un fichero de datos en algo verificable: añadir un tema nuevo tiene red de seguridad.
