# @satellatickets/core

La parte de satella-ui que no depende de la plataforma: los contratos de props de cada componente, las constantes de variantes, el contexto de tema y los hooks headless. Solo depende de `react` y de `@satellatickets/tokens`; nunca importa `react-dom` ni `react-native`.

`@satellatickets/ui` lo usa para que `<Button variant="primary">` signifique lo mismo en web y en móvil. Puede instalarse solo si necesitas la lógica o los tipos sin las vistas.

```ts
import { buttonVariants, useButton, useTheme, type ButtonProps } from '@satellatickets/core';

buttonVariants.variant; // ['primary', 'secondary', 'ghost', 'danger']

// Comportamiento común de un botón: deshabilitado o cargando no dispara onPress.
const { interactive, press } = useButton({ loading, onPress });

// Tokens del tema activo, con la marca aplicada.
const theme = useTheme();
theme.color.action.primary;
```

## Qué contiene

| Qué                     | Ejemplos                                                                        |
| ----------------------- | ------------------------------------------------------------------------------- |
| Contratos de props      | `ButtonProps`, `BadgeProps`, `BoxProps`, `StackProps`, `TextProps`, `IconProps` |
| Constantes de variantes | `buttonVariants`, `badgeVariants`, `textVariants`, `iconSizes`                  |
| Tema                    | `UIContext`, `useTheme`, `useColorScheme`, `useBrand`, `resolveTheme`           |
| Hooks headless          | `useButton`                                                                     |

Las variantes se exportan como arrays `as const`, además de como tipos, para poder recorrerlas: en historias, en selectores o en tests.

## Instalación

```bash
npm install @satellatickets/core
```

Requiere `react >=19.0`.
