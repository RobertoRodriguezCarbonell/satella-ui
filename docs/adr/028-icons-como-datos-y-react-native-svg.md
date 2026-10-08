# ADR-028: `icons` como paquete de datos y `react-native-svg` como peer opcional

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-002 y ADR-019 describían `icons` como componentes generados para web y nativo, con doble build. Al implementar `Icon` aparecen dos hechos: React Native no dibuja SVG sin una librería (`react-native-svg` es el estándar y viene en Expo Go), y los trazos de un icono son los mismos en ambas plataformas.

## Decisión

- `@satellatickets/icons` es un **paquete de datos sin React**: SVG fuente en `svg/` (lucide, licencia ISC, ver `NOTICE.md`) y `src/icons.ts` generado con los trazos como primitivas (`path`, `circle`, `line`, `rect`), más `iconNames` e `IconName`. Una sola build.
- Las vistas `Icon.web.tsx` e `Icon.native.tsx` viven en `ui`, que sigue siendo el único paquete con ficheros por plataforma (CLAUDE.md §4). La web dibuja `<svg>`; la nativa usa `react-native-svg`.
- `react-native-svg` es **peer opcional** de `@satellatickets/ui` (`>=15`), como `react-native`: solo lo instalan las apps nativas. Nunca se empaqueta.
- El contrato `IconProps<Name>` de `core` es genérico en el nombre, porque `core` no puede importar `icons` (ADR-002); `ui` lo especializa con `IconName`.
- Un icono nuevo es un SVG en `svg/` + `pnpm generate`; el test comprueba que `src/icons.ts` está sincronizado.

## Alternativas descartadas

- **Componentes generados por icono en `icons` con doble build.** Duplica la infraestructura de `ui` para un paquete interno y mete React en un paquete que solo necesita datos.
- **Iconos como fuente de iconos.** Requiere cargar una fuente en cada app y pierde el control del trazo y del color por token.

## Consecuencias

- Sustituye el detalle de `icons` en ADR-002 y ADR-019; el resto de ambos ADR sigue vigente.
- Añadir `react-native-svg` a la lista de peers es un cambio `minor` en `0.x` que las apps nativas deben instalar.
