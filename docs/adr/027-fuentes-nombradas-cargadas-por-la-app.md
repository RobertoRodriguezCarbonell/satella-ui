# ADR-027: Las fuentes se nombran en los tokens y las carga la app

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

La identidad de Satella usa tres familias (Unbounded para titulares, Hanken Grotesk para texto, IBM Plex Mono para etiquetas). Los tokens tipográficos deben funcionar en web y en React Native, pero la forma de cargar una fuente es distinta en cada plataforma y propia de cada app (Next.js con `next/font`, Expo con `expo-font`, un proyecto nativo con sus assets).

## Decisión

- La librería **no empaqueta ficheros de fuente**. Los tokens `font.family.*` solo nombran las familias; en web, como pila CSS (`"Hanken Grotesk", ui-sans-serif, …`); en nativo, como el nombre de familia exacto (`"Hanken Grotesk"`).
- Las vistas nativas combinan `fontFamily` (nombre de familia) con `fontWeight` numérico. Para que eso funcione en iOS y Android, la app registra cada familia **con todos sus pesos bajo ese nombre**: en Expo, con el plugin de configuración de `expo-font` (`fontDefinitions` con `weight`), que embebe las fuentes en la build; en desarrollo con Expo Go, `useFonts` con una definición de familia por pesos.
- Si una app no carga una fuente, la plataforma cae a su fuente de sistema sin romper nada.
- Los Storybooks cargan las fuentes de Google Fonts: el web con un `<link>` en `preview-head.html`; el nativo con los paquetes `@expo-google-fonts/*`.

## Alternativas descartadas

- **Empaquetar las fuentes en `@satellatickets/ui`.** Obligaría a cada app a copiar assets de `node_modules` a su build nativa y pesa varios megabytes por una decisión que es de la app.
- **Un nombre de familia distinto por peso** (`HankenGrotesk-Bold`). Es lo que exige Android cuando las fuentes se cargan en tiempo de ejecución sin definición de familia, pero obliga a las vistas a calcular nombres y rompe la paridad con web.

## Consecuencias

- `font.family.*` es un contrato de nombres: cambiar una familia es un cambio `minor` de tokens y un cambio de assets en cada app.
- Las apps documentan en su README qué fuentes cargan y con qué nombres.
