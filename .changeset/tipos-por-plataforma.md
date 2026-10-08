---
'@satellatickets/ui': minor
---

Los tipos de props propios de cada plataforma se exportan solo donde existen: `ButtonWebProps`, `BoxWebProps`, `TextElement` y el resto de tipos `*WebProps` en la versión web; los `*NativeProps` en la de React Native. Los tipos comunes (`ButtonProps`, `BoxProps`…) no cambian. Antes, los tipos de la versión web importaban `react-native`, y el typecheck de una app web fallaba con `skipLibCheck: false`.

El paquete incluye ahora un README con la instalación y el uso en cada plataforma.
