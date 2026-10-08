# ADR-033: `react-native-svg` no se instala automáticamente

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-028 declara `react-native-svg` como peer opcional de `@satellatickets/ui`. En nativo, sin embargo, es imprescindible: dibuja los iconos, y `Button` y `Spinner` los usan. Una app nativa tiene que instalarlo aparte, y eso se percibe como un paso que la librería podría ahorrar.

npm no distingue entre una app web y una nativa: una dependencia se instala en las dos o en ninguna. Se probó qué recibe una app web vacía al instalar el paquete con cada declaración posible:

| Declaración de `react-native-svg` | Paquetes instalados | `node_modules` |
|---|---|---|
| Peer opcional (ADR-028) | 6 | 7,7 MB |
| Peer obligatorio | 248 | 188 MB |
| Dependencia normal | 248 | 188 MB |

En los dos últimos casos npm instala también `react-native`, porque es un peer obligatorio de `react-native-svg`.

## Decisión

`react-native-svg` sigue siendo un **peer opcional**. No se instala solo. La documentación da un único comando para nativo:

```bash
npx expo install @satellatickets/ui react-native-svg
```

"Opcional" significa aquí "no hace falta en web". En nativo es obligatorio, y así lo dice el README.

## Alternativas descartadas

- **Peer obligatorio o dependencia normal.** Mete React Native entero en cada app web. En nativo tampoco lo resuelve: npm instalaría la última versión publicada y no la que corresponde al SDK de Expo de la app, y en React Native sin Expo un módulo nativo que no figura en el `package.json` de la app no se enlaza.
- **Quitar la dependencia dibujando los iconos nativos como imágenes ya generadas.** Elimina el paso, pero pierde nitidez, añade un paso de rasterizado al build y engorda el paquete. Además, una app de entradas necesitará SVG de todos modos, por ejemplo para los códigos QR.
- **Un script `postinstall` que lo instale.** Modifica el proyecto de quien instala sin que lo pida, y los gestores de paquetes bloquean cada vez más esos scripts.

## Consecuencias

- Las apps web no reciben nada de React Native.
- Las apps nativas instalan dos paquetes con un comando, y `expo install` elige la versión compatible con su SDK.
- Si falta, Metro falla al empaquetar con un error que nombra `react-native-svg` y el paquete que lo pide.
- Es la misma convención que siguen las librerías de React Native con módulos nativos.
