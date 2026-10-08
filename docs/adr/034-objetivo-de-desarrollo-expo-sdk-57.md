# ADR-034: Objetivo de desarrollo: Expo SDK 57 y React Native 0.86

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-024 fija como objetivo de desarrollo Expo SDK 56 y React Native 0.85. Expo Go, la app con la que se abren los catálogos en un móvil real, solo ejecuta proyectos del SDK más reciente: la versión de las tiendas ya es la del SDK 57 y rechaza un proyecto del 56. ADR-024 prevé revisar la ventana en cada release del SDK de Expo.

## Decisión

El objetivo de desarrollo pasa a:

| | Antes | Ahora |
|---|---|---|
| Expo (apps internas) | SDK 56 | SDK 57 |
| React Native | 0.85.3 | 0.86.3 |
| React / React DOM | 19.2.3 | 19.2.3, sin cambio |
| `jest-expo` y `@react-native/jest-preset` | 56 y 0.85 | 57 y 0.86 |

Los módulos nativos de las apps (`react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`, `expo-font`, `expo-status-bar`) van en la versión que fija el SDK 57. `react-native-svg` no cambia.

**Los mínimos de los paquetes publicados no cambian**: `react >=19.0` y `react-native >=0.81`. No es un cambio que afecte a las apps consumidoras ni necesita changeset.

## Alternativas descartadas

- **Quedarse en el SDK 56.** Obligaría a usar un build de desarrollo propio o una versión antigua de Expo Go para ver los catálogos en un dispositivo real.
- **Subir también el mínimo de React Native.** Nada de la librería lo exige, y sería un breaking change sin beneficio.

## Consecuencias

- Sustituye la columna "Objetivo de desarrollo" de ADR-024 para Expo y React Native; el resto de ADR-024 sigue vigente.
- Cada nuevo SDK de Expo obligará a repetir esta subida para seguir usando Expo Go. Se hace a mano, todos los módulos a la vez, porque Renovate los tiene excluidos.
- `expo install --check` sigue avisando de TypeScript, que espera la 6.x. Se mantiene la 5.x por ADR-014.
