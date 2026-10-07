# ADR-006: Formato DTCG 2025.10 y Style Dictionary v5

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Los tokens (ADR-005) deben escribirse una vez y transformarse en variables CSS para web y en objetos TypeScript para React Native, además de generar tipos. Conviene un formato estándar que permita intercambio con herramientas de diseño.

## Decisión

- **Formato de fuente:** la especificación del W3C Design Tokens Community Group en su versión estable **2025.10**, en ficheros `*.tokens.json` con `$value`, `$type` y referencias `{grupo.token}`.
- **Transformación:** **Style Dictionary v5**, que adopta esa especificación como formato base, configurado en `packages/tokens/build.ts`.

Salidas generadas en `packages/tokens/dist/` (nunca se editan a mano):

| Salida | Contenido |
|---|---|
| `web/tokens.css` | Variables CSS: bloque `:root, [data-theme="light"]`, bloque `[data-theme="dark"]`, un bloque `[data-brand="…"]` por marca |
| `native/themes.ts` | Objeto `themes` con un subobjeto por tema y marca; valores numéricos (sin `px`/`rem`) |
| `types.ts` | Tipos TS con los nombres de todos los tokens semánticos |

Transformaciones específicas (unidades, tipografía compuesta, sombras) se definen en `build.ts` una sola vez.

## Alternativas descartadas

- **Formato propio en TS.** Más cómodo al principio, pero sin interoperabilidad con Figma/Tokens Studio y con un pipeline casero que mantener.
- **Variables CSS escritas a mano + objeto TS duplicado.** Dos fuentes de verdad; divergen con el tiempo.

## Consecuencias

- Los tokens pueden ir y venir de Figma sin conversiones manuales.
- Los tipos generados hacen que usar un token inexistente sea un error de compilación.
- Un paso de build previo (`tokens` antes que `ui`), orquestado por Turborepo, con modo watch en desarrollo.
