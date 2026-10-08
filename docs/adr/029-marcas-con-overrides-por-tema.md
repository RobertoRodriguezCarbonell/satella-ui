# ADR-029: Marcas con overrides comunes y por tema

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-006 preveía un único bloque `[data-brand="…"]` por marca, es decir, overrides independientes del tema. Un color de marca rara vez cumple contraste AA con el mismo texto en claro y en oscuro, y el producto de Satella define sus marcas (`admin`, `organizer`) solo para el tema oscuro.

## Decisión

- Una marca es una carpeta `src/brands/<nombre>/` con `brand.tokens.json` (overrides para todos los temas) y, opcionalmente, `<tema>.tokens.json` (overrides solo para ese tema). Cualquiera de los dos puede faltar.
- Salida web: un bloque `[data-brand="x"]` con lo que cambia en el tema por defecto y, solo si hace falta, `[data-theme="y"][data-brand="x"]` con lo que la cascada aún no aporta para cada otro tema. El build lo calcula; nunca se escribe a mano.
- Salida nativa: `brands.x.<tema>` con los overrides de cada tema; `UIProvider` los combina sobre el tema activo (ADR-010).
- Los tests de completitud y contraste se ejecutan para cada marca en cada tema.

## Alternativas descartadas

- **Overrides solo independientes del tema** (ADR-006 literal). Obliga a elegir entre cumplir AA en un tema o en otro.
- **Una marca = un tema completo.** Duplica todos los tokens por marca y pierde la relación con el tema base.

## Consecuencias

- Amplía ADR-006 en la parte de marcas; el resto sigue vigente.
- Las marcas pueden ser parciales por tema: `admin` y `organizer` solo definen el oscuro y caen al tema base en claro.
