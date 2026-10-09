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

## 8. Tablas y paginación

`Table` pinta las filas que recibe y en el orden en que las recibe. No ordena, no filtra y no pagina: quien tiene los datos es la app o el servidor (ADR-045). Lo que sí hace es avisar de lo que el usuario pide.

```tsx
const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true, sortable: true, cell: (order) => `#${order.id}` },
  { key: 'buyer', header: 'Comprador', minWidth: 160, cell: (order) => order.buyer },
  { key: 'total', header: 'Total', align: 'end', sortable: true, cell: (order) => euros(order.total) },
  { key: 'status', header: 'Estado', cell: (order) => <Badge variant="success">Pagado</Badge> },
];

const [sort, setSort] = useState<TableSort | null>({ column: 'id', direction: 'descending' });
const [page, setPage] = useState(1);
const { data, isLoading } = useOrders({ sort, page });

<Table
  accessibilityLabel="Pedidos"
  columns={columns}
  rows={data?.orders ?? []}
  getRowKey={(order) => order.id}
  sort={sort}
  onSortChange={setSort}
  loading={isLoading}
  empty="Todavía no hay pedidos."
/>
<Pagination
  page={page}
  pageCount={data?.pageCount ?? 1}
  onPageChange={setPage}
  accessibilityLabel="Páginas de pedidos"
  previousLabel="Página anterior"
  nextLabel="Página siguiente"
  getPageLabel={(number) => `Página ${number}`}
/>;
```

- **Columnas.** `cell` devuelve el contenido de la celda: texto, un número o cualquier componente. `align: 'end'` para los números. La columna con `rowHeader` es la que identifica a la fila. Una columna de acciones no necesita título a la vista: `headerHidden`.
- **Anchos.** En web el navegador los reparte según el contenido. En React Native no hay nada que mida el contenido de una columna: cada una parte de `minWidth` (128 puntos si no se indica) y crece con las demás, o mide `width` si lo tiene. Da un `minWidth` a las columnas de texto largo. Si la tabla no cabe, se desplaza en horizontal: lo que debe verse siempre va en las primeras columnas.
- **Ordenación.** Una columna `sortable` avisa con `onSortChange`; la app pide los datos en ese orden y se los pasa de nuevo. Si ordena en el cliente, lo hace antes de pasar `rows`.
- **Selección.** Con `selectable`, `selectedKeys` guarda las claves de `getRowKey`, también las de filas de otras páginas. Los nombres de las casillas (`selectAllLabel`, `getRowSelectionLabel`) son obligatorios.
- **Carga.** `loading` sustituye las filas por huecos. Para conservar las filas mientras llega la página siguiente, no lo actives en las recargas: deshabilita la paginación con `disabled`.
- **Navegar al detalle.** Las filas no se pulsan. El enlace va en una celda, con `Link`.
- **Paginación en un móvil.** Si los botones no caben en una línea, siguen en la siguiente. Con `size="sm"` o con `siblingCount={0}` caben en la pantalla de un teléfono.

## 9. Fechas

Una fecha es un texto ISO, `'2026-10-09'`, sin hora ni zona horaria; sin fecha, la cadena vacía (ADR-046). Es lo que guarda un `DatePicker`, lo que viaja en un formulario y lo que espera una columna `date` de la base de datos.

```tsx
const [date, setDate] = useState('');

<FormField label="Fecha del evento" required>
  <DatePicker
    locale="es"
    value={date}
    onValueChange={setDate}
    min={todayISO()}
    placeholder="Elige una fecha"
    previousMonthLabel="Mes anterior"
    nextMonthLabel="Mes siguiente"
  />
</FormField>;
```

`Calendar` es el mismo calendario sin el campo, para ponerlo en una página o dentro de un `Sheet`. Con `mode="range"` elige un periodo:

```tsx
const [range, setRange] = useState<DateRange>({ start: '', end: '' });

<Calendar
  mode="range"
  locale="es"
  value={range}
  onValueChange={setRange}
  isDateMarked={(day) => daysWithSales.has(day)}
  previousMonthLabel="Mes anterior"
  nextMonthLabel="Mes siguiente"
/>;
```

- **No conviertas a `Date` para guardar.** `new Date('2026-10-09')` es un instante, y en otra zona horaria es el día 8. Si la app ya tiene un `Date`, conviértelo en el borde: `toISODate(d.getFullYear(), d.getMonth() + 1, d.getDate())`. `todayISO()`, `addDays()` y `addMonths()` de `@satellatickets/core` operan sobre el texto.
- **`locale` es obligatorio** y decide el idioma de los meses, los días y la fecha escrita en el campo. La semana empieza en lunes; `weekStartsOn={0}` la empieza en domingo.
- **En Next.js, pasa `today`** desde el servidor (`today={todayISO()}` en un Server Component) si no hay fecha elegida: el día de hoy del servidor y el del navegador pueden no coincidir, y la página fallaría al hidratarse.
- **Un periodo llega en dos pasos.** Tras la primera pulsación, `onValueChange` recibe `{ start, end: '' }`; tras la segunda, el periodo completo y ordenado. Lanza la consulta cuando `end` no esté vacío.
- **`onMonthChange`** avisa del mes que se ve (`'2026-11'`), para pedir los días que hay que señalar.
- **Dentro de tu propio `Sheet` o `Modal`**, `onDatePress` avisa de cada pulsación sobre un día, también sobre el que ya estaba elegido: úsalo para cerrar.

## 10. Tema y marca

```tsx
<UIProvider theme="system" brand="organizer">
  …
</UIProvider>
```

- `theme`: `light`, `dark` o `system`.
- `brand`: una marca definida en los tokens (`admin`, `organizer`). Sin ella se usa la identidad de Satella.

Un `UIProvider` anidado cambia el tema o la marca de una zona. Los toasts siguen saliendo por el de fuera.

## 11. Madurez y versiones

Todos los componentes son todavía `experimental`: su API puede cambiar en cualquier `minor` mientras la librería esté en `0.x` (ADR-026).

- Fija la versión exacta en el `package.json` de la app.
- Lee el `CHANGELOG` de [`ui`](../packages/ui/CHANGELOG.md) antes de actualizar.
- Un componente pasa a `stable` cuando está en producción en dos apps. Si adoptas uno y algo no encaja, es el momento de decirlo.
