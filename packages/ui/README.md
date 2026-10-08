# @satellatickets/ui

Componentes de satella-ui con **una sola API para React (web) y React Native**. Las apps importan lo mismo en ambas plataformas y el bundler de cada una resuelve la vista correcta: HTML y CSS reales en web, componentes nativos en móvil.

```tsx
import { Button, Stack, Text, UIProvider } from '@satellatickets/ui';

export function Compra() {
  return (
    <UIProvider theme="dark">
      <Stack gap={4} align="start">
        <Text variant="title">Noche Satella</Text>
        <Button iconStart="ticket" onPress={comprar}>
          Comprar entradas
        </Button>
      </Stack>
    </UIProvider>
  );
}
```

## Instalación

```bash
npm install @satellatickets/ui
```

`@satellatickets/core` y `@satellatickets/tokens` llegan como dependencias. `react` es un peer en ambas plataformas (`>=19.0`).

### Web

Requiere `react-dom >=19.0`. Importa los estilos **una vez**, en la entrada de la app:

```ts
import '@satellatickets/ui/styles.css';
```

Es un CSS estático, sin runtime de estilos: funciona con SSR y Server Components, y cambiar de tema no re-renderiza nada.

### React Native

Requiere `react-native >=0.81` con la Nueva Arquitectura y `react-native-svg >=15`, que dibuja los iconos. Se instalan juntos:

```bash
npx expo install @satellatickets/ui react-native-svg
```

`react-native-svg` no se instala solo a propósito. Es un módulo nativo: tiene que figurar en el `package.json` de la app para que se enlace, y `expo install` elige la versión que corresponde a tu SDK. Además, así las apps web no lo reciben.

No hay nada más que configurar: Metro resuelve la versión nativa del paquete.

### Fuentes

La librería nombra las familias de Satella (Unbounded, Hanken Grotesk e IBM Plex Mono) pero no las empaqueta: las carga cada app, con `next/font` o un `<link>` en web y con `expo-font` en nativo. Si una fuente no está cargada, se usa la del sistema.

## Tema y marca

`UIProvider` envuelve la app, o cualquier zona de ella, y aplica el tema y la marca:

```tsx
<UIProvider theme="system" brand="organizer">
  …
</UIProvider>
```

- `theme`: `light`, `dark` o `system` (por defecto, el del sistema).
- `brand`: una marca definida en los tokens (`admin`, `organizer`). Sin ella se usa la identidad por defecto.

Los hooks `useTheme()`, `useColorScheme()` y `useBrand()` dan acceso al tema resuelto.

## Componentes

| Grupo       | Componentes                    |
| ----------- | ------------------------------ |
| Fundamentos | `Box`, `Stack`, `Text`, `Icon` |
| Acciones    | `Button`, `IconButton`, `Link` |
| Feedback    | `Badge`, `Spinner`             |

Cada componente declara su madurez en el catálogo. Todos son todavía `experimental`: su API puede cambiar en cualquier `minor` mientras la librería esté en `0.x`. Fija la versión exacta y lee el `CHANGELOG` al actualizar.

El catálogo, con todas las variantes, los estados y la documentación de cada componente, está en el [Storybook](https://robertorodriguezcarbonell.github.io/satella-ui/).

## Tipos

Las props comunes a ambas plataformas se llaman `<Componente>Props` (`ButtonProps`). Cada plataforma exporta además las suyas: `ButtonWebProps` en web, con `className`, `style` y `type`, y `ButtonNativeProps` en React Native.
