# ADR-011: Dos Storybooks: react-vite para web y react-native en Expo

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Cada componente tiene una vista web y una nativa (ADR-001). Hay que verlas funcionando, aisladas de cualquier app, mientras se desarrollan, con recarga en caliente y controles para cambiar props en vivo.

## Decisión

Dos aplicaciones de catálogo en `apps/`:

| | `storybook-web` | `storybook-native` |
|---|---|---|
| Framework | `@storybook/react-vite` (React DOM puro) | `@storybook/react-native` dentro de una app **Expo** |
| Renderiza | `*.web.tsx` con CSS Modules | `*.native.tsx` con `StyleSheet` |
| Se ve en | Navegador | Simulador iOS/Android o dispositivo físico (QR de Expo) |
| Rol adicional | Documentación pública de la librería, desplegada en cada push a `main` | Validación del comportamiento nativo real |

Ambos **consumen el código fuente** de `packages/` directamente, sin compilar la librería. El paso de build existe solo para publicar.

`pnpm dev` levanta tokens en watch + `storybook-web`; `pnpm dev:native` levanta `storybook-native`.

## Alternativas descartadas

- **Un solo Storybook con `@storybook/react-native-web-vite`.** Renderiza las vistas nativas vía `react-native-web`. No sirve: nuestras vistas web son HTML y CSS reales y deben verse tal cual las recibirán las apps web. Las vistas nativas, a su vez, deben verse en nativo real.
- **Sin catálogo nativo, solo tests.** Pierde la revisión visual del móvil, que es donde más diferencias aparecen.

## Consecuencias

- Dos configuraciones que mantener, pero las historias son una sola (ADR-012).
- `storybook-native` requiere Expo SDK 56 y un simulador o dispositivo; en CI se usan solo los tests nativos (ADR-017), no el Storybook.
