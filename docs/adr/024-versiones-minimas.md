# ADR-024: Versiones mínimas soportadas y ventana de soporte

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Una librería debe declarar qué versiones de React y React Native soporta. La librería es nueva y no arrastra deuda, así que puede partir de versiones recientes y aprovechar sus APIs.

## Decisión

| | Mínimo (peer) | Objetivo de desarrollo |
|---|---|---|
| React / React DOM | `>=19.0` | 19.2 |
| React Native | `>=0.81`, **solo Nueva Arquitectura** | 0.85 |
| Expo (apps internas) | — | SDK 56 |
| Node (desarrollo y CI) | 22 LTS | 22 |
| TypeScript | 5.x | última estable |
| pnpm | 10.x | última estable |

Motivos:

- **React 19** es la versión actual en Next.js 16 y Expo SDK 56. Soportar React 18 implicaría renunciar a mejoras de refs y tipos sin beneficio real.
- **React Native 0.81** es donde el ecosistema de estilos y la Nueva Arquitectura se han estabilizado. Expo SDK 56 incluye React Native 0.85 y React 19.2.
- **Nueva Arquitectura únicamente**: es lo que soporta el ecosistema actual y simplifica el testing. No se prueba ni se garantiza nada bajo la arquitectura antigua.

**Política de ventana:**

- Se soportan las **dos últimas versiones minor de React Native** y la **versión major actual de React**.
- **Subir un mínimo es un cambio `major`** (en `0.x`, `minor`, documentado como breaking).
- La ventana se revisa trimestralmente (ADR-026) y en cada release de Expo SDK.

Las apps de prueba y los Storybooks fijan versiones exactas; los peers de los paquetes publicados usan rangos `>=`.

## Alternativas descartadas

- **Soportar React 18.** Más usuarios potenciales, pero más superficie de test y menos APIs disponibles. La librería es para las apps propias, que ya están o estarán en React 19.
- **Soportar la arquitectura antigua de React Native.** Doble matriz de pruebas por algo que el ecosistema está abandonando.

## Consecuencias

- Matriz de pruebas pequeña y manejable.
- Una app que esté por debajo de los mínimos debe actualizarse antes de adoptar la librería.
- `react-native` y `react` se excluyen de las actualizaciones automáticas de Renovate/Dependabot y se actualizan a mano, con un changeset si cambia el mínimo.
