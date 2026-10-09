# Adoptar satella-ui en una app

Cómo instalar y usar `@satellatickets/ui` en una app Next.js, en una app React con Vite y en una app Expo. Los ejemplos de esta guía no son ilustrativos: salen de apps que la CI construye en cada cambio.

| Entorno             | App de ejemplo                                   |
| ------------------- | ------------------------------------------------ |
| Next.js, App Router | [`tests/consumer-next`](../tests/consumer-next)   |
| Vite                | [`apps/playground-web`](../apps/playground-web)   |
| Expo                | [`apps/playground-native`](../apps/playground-native) |

## Requisitos

| Dependencia                     | Versión mínima                    |
| ------------------------------- | --------------------------------- |
| React                           | 19.0                              |
| React DOM, en web               | 19.0                              |
| React Native, en nativo         | 0.81, con la Nueva Arquitectura   |
| `react-native-svg`, en nativo   | 15                                |

## 1. Instalar

En web:

```bash
npm install @satellatickets/ui
```

En Expo, junto con `react-native-svg`, que dibuja los iconos:

```bash
npx expo install @satellatickets/ui react-native-svg
```

`@satellatickets/core` y `@satellatickets/tokens` llegan como dependencias. No hay nada que configurar en el bundler.

## 2. Estilos y proveedor

La app importa los estilos una vez, solo en web, y se envuelve en `UIProvider`. El proveedor aplica el tema y la marca, y es quien pinta los toasts: va en la raíz.

**Next.js**, en `app/layout.tsx`:

```tsx
import '@satellatickets/ui/styles.css';
import { UIProvider } from '@satellatickets/ui';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <UIProvider theme="dark">{children}</UIProvider>
      </body>
    </html>
  );
}
```

**Vite**, en la entrada de la app:

```tsx
import '@satellatickets/ui/styles.css';
import { UIProvider } from '@satellatickets/ui';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <UIProvider theme="dark">
    <App />
  </UIProvider>,
);
```

**Expo**, en `App.tsx`. No hay hoja de estilos que importar:

```tsx
import { UIProvider } from '@satellatickets/ui';

export default function App() {
  return (
    <UIProvider theme="dark">
      <Pantalla />
    </UIProvider>
  );
}
```

En nativo, los toasts se colocan respecto a la vista que contiene al `UIProvider`. Por eso tiene que envolver la app entera, no una pantalla.

## 3. Fuentes

La librería nombra las familias de Satella, pero no las empaqueta: las carga cada app (ADR-027). Si una no está cargada, se usa la del sistema.

| Uso      | Familia          | Pesos              |
| -------- | ---------------- | ------------------ |
| Titulares | Unbounded       | 400, 700           |
| Texto    | Hanken Grotesk   | 400, 500, 600, 700 |
| Etiquetas | IBM Plex Mono   | 400, 500           |

En web, con los paquetes de `@fontsource`, que conservan el nombre de cada familia:

```ts
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/hanken-grotesk/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/unbounded/400.css';
import '@fontsource/unbounded/700.css';
```

`next/font` no sirve tal cual: da a cada familia un nombre generado, y los tokens buscan `"Hanken Grotesk"`.

En Expo, con `expo-font`. El ejemplo completo está en [`apps/playground-native/App.tsx`](../apps/playground-native/App.tsx).

## 4. Next.js

Los componentes se importan directamente desde una página o un layout, que son Server Components. El paquete ya lleva `"use client"` (ADR-041):

```tsx
// app/page.tsx: un Server Component
import { buttonVariants } from '@satellatickets/core';
import { Badge, Button, Card, Stack, Text } from '@satellatickets/ui';

export default function Page() {
  return (
    <Stack gap={4}>
      <Text variant="title">Noche Satella</Text>
      <Badge variant="warning">Últimas entradas</Badge>
      <Card>
        <Button iconStart="ticket">Comprar entradas</Button>
      </Card>
      <Text variant="caption">{buttonVariants.variant.join(', ')}</Text>
    </Stack>
  );
}
```

Dos cosas que conviene saber:

- **Los manejadores exigen un Client Component.** Un Server Component no puede pasar funciones. Lo que use `onPress`, `onChangeText`, estado o un hook como `useToast` va en un fichero con `"use client"`. Es una regla de React, no de la librería.
- **Con `theme="system"`, el servidor pinta el tema claro.** No conoce el del dispositivo hasta que la página se hidrata. Si la app tiene un solo tema, fíjalo con `theme="dark"`.

Para navegar sin recargar la página, `Link` cede la navegación al router:

```tsx
'use client';

import { Link } from '@satellatickets/ui';
import { useRouter } from 'next/navigation';

export function EnlaceDeAyuda() {
  const router = useRouter();
  return (
    <Link
      href="/ayuda"
      onPress={(event) => {
        event.preventDefault();
        router.push('/ayuda');
      }}
    >
      Ayuda
    </Link>
  );
}
```

El `href` se mantiene: el enlace se puede abrir en una pestaña nueva, y con un modificador pulsado `onPress` no se llama.

## 5. Expo y React Native

- Metro resuelve solo la versión nativa del paquete. No hace falta tocar `metro.config.js`.
- `react-native-svg` tiene que figurar en el `package.json` de la app para que se enlace (ADR-033).
- `Link` abre su `href` con `Linking`. Para una ruta interna, la app navega en `onPress`, igual que en Next.js: `event.preventDefault()` y la llamada a su router.
- La librería no conoce las zonas seguras del dispositivo. `Sheet` y los toasts dejan un margen inferior fijo, y el resto de la pantalla lo resuelve la app, como con cualquier otra vista.
- Los componentes de la librería se combinan con los de React Native. Un `ScrollView` o un `FlatList` alrededor de ellos es lo normal.

## 6. Formularios

Los controles avisan con el valor, no con el evento, y la librería no valida: la app decide qué es un error y se lo pasa a `FormField` (ADR-037).

```tsx
const [email, setEmail] = useState('');
const [enviado, setEnviado] = useState(false);
const error = enviado && !email.includes('@') ? 'Escribe un correo válido.' : undefined;

<FormField label="Correo electrónico" required help="Te enviaremos las entradas aquí." error={error}>
  <Input type="email" value={email} onChangeText={setEmail} onSubmit={() => setEnviado(true)} />
</FormField>;
```

| Control              | Valor              | Evento                    |
| -------------------- | ------------------ | ------------------------- |
| `Input`, `TextArea`  | `value: string`    | `onChangeText(texto)`     |
| `Checkbox`, `Switch` | `checked: boolean` | `onCheckedChange(marcado)` |
| `Select`             | `value: string`    | `onValueChange(valor)`    |

Sin `value`, el control guarda su propio estado a partir de `defaultValue`. En web, además, viaja en un `<form>` con su `name`.

Con una librería de formularios, el control se conecta por sus dos props. Con `react-hook-form`, por ejemplo, dentro de un `Controller`: `value={field.value}` y `onChangeText={field.onChange}`.

## 7. Avisos

Los toasts se lanzan desde cualquier componente bajo el `UIProvider`:

```tsx
const toast = useToast();

toast.show({
  tone: 'success',
  title: 'Compra completada',
  description: 'Hemos enviado las entradas a tu correo.',
});
```

Para un mensaje que no debe desaparecer solo, usa `Alert`.

La librería no trae textos propios. El botón de cierre de `Alert`, `Modal`, `Sheet` y de un toast solo aparece si la app le da nombre con `closeLabel`.

## 8. Tema y marca

```tsx
<UIProvider theme="system" brand="organizer">
  …
</UIProvider>
```

- `theme`: `light`, `dark` o `system`.
- `brand`: una marca definida en los tokens (`admin`, `organizer`). Sin ella se usa la identidad de Satella.

Un `UIProvider` anidado cambia el tema o la marca de una zona. Los toasts siguen saliendo por el de fuera.

## 9. Madurez y versiones

Todos los componentes son todavía `experimental`: su API puede cambiar en cualquier `minor` mientras la librería esté en `0.x` (ADR-026).

- Fija la versión exacta en el `package.json` de la app.
- Lee el `CHANGELOG` de [`ui`](../packages/ui/CHANGELOG.md) antes de actualizar.
- Un componente pasa a `stable` cuando está en producción en dos apps. Si adoptas uno y algo no encaja, es el momento de decirlo.
