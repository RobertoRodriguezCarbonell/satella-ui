# satella-ui

Design system de Satella Tickets en código: tokens de diseño y componentes con **una sola API para React (web) y React Native**.

```tsx
import { Button } from '@satellatickets/ui';

<Button iconStart="ticket" onPress={comprar}>
  Comprar entradas
</Button>;
```

El mismo import funciona en una app Next.js y en una app Expo. En web se renderiza HTML semántico con CSS estático; en móvil, componentes nativos.

- **Catálogo y documentación**: [Storybook](https://robertorodriguezcarbonell.github.io/satella-ui/)
- **Decisiones de arquitectura**: [`docs/adr`](docs/adr/README.md)
- **Plan de trabajo**: [`ROADMAP.md`](ROADMAP.md)

## Paquetes

| Paquete                                     | Para qué                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [`@satellatickets/ui`](packages/ui)         | Los componentes. Es lo que instala una app.                                 |
| [`@satellatickets/core`](packages/core)     | Contratos de props, variantes, tema y hooks, sin nada de plataforma.        |
| [`@satellatickets/tokens`](packages/tokens) | Tokens de diseño en formato DTCG, con salidas para CSS y para React Native. |

## Uso en una app

```bash
npm install @satellatickets/ui
```

En web, importa una vez `@satellatickets/ui/styles.css`. En React Native, instala `react-native-svg`. En ambas, envuelve la app en `<UIProvider>`. Los detalles están en el [README de `ui`](packages/ui/README.md).

## Desarrollo

Requiere Node 22 y pnpm 10.

```bash
pnpm install
pnpm dev            # Storybook web y tokens en modo watch
pnpm dev:native     # Storybook nativo en Expo
pnpm test           # tests unitarios, historias en Chromium y tests nativos
pnpm lint && pnpm typecheck
pnpm build
pnpm check:packages # publint y prueba de consumo de los paquetes empaquetados
```

Las reglas para contribuir están en [`CLAUDE.md`](CLAUDE.md), y el patrón que sigue cada componente, con `Button` como referencia, en la página "Patrón" del Storybook. Cada cambio termina con un changeset (`pnpm changeset`).
