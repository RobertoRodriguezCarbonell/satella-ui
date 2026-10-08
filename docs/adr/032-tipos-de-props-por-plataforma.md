# ADR-032: Los tipos de props de cada plataforma se exportan desde su vista

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-009 establece que una prop específica de una plataforma se añade en `<Nombre>.types.ts` de `ui`. Ese fichero declara `<Nombre>WebProps` y `<Nombre>NativeProps`, y el `index.ts` de cada componente exportaba los dos. Como el índice es el mismo para ambas builds, las declaraciones de tipos publicadas para web incluían los tipos nativos e importaban `react-native`, que una app web no tiene instalado. Con `skipLibCheck: false`, el typecheck de esa app fallaba.

## Decisión

- `<Nombre>.types.ts` no cambia: sigue declarando juntos el contrato común y las extensiones de cada plataforma, para verlas de un vistazo (ADR-004).
- Cada vista **exporta el tipo de sus propias props**: `Button.web.tsx` exporta `ButtonWebProps` y `Button.native.tsx` exporta `ButtonNativeProps`.
- El `index.ts` del componente recoge esos tipos con `export type * from './<Nombre>'`, sin nombrar la plataforma, y exporta aparte el contrato común:

```ts
export { Button } from './Button';
export type * from './Button';
export type { ButtonProps } from './Button.types';
```

Resultado: `<Nombre>Props` existe en las dos plataformas; `<Nombre>WebProps` solo en la build web y `<Nombre>NativeProps` solo en la nativa.

## Alternativas descartadas

- **Dos ficheros de tipos por componente (`.types.web.ts` y `.types.native.ts`).** Resuelve lo mismo con más ficheros y separa lo que conviene comparar junto.
- **Dejarlo como estaba y confiar en `skipLibCheck`.** Es el valor por defecto de muchas plantillas, pero no de todas, y los tipos nativos exportados en web no servían para nada.

## Consecuencias

- Las declaraciones de tipos de web solo dependen de `react` y `@satellatickets/core`; las nativas, además, de `react-native`.
- Código que quiera compartirse entre web y nativo debe usar `<Nombre>Props`, no los tipos de plataforma.
- La prueba de consumo de `pnpm check:packages` (ADR-031) impide que el problema vuelva.
