---
'@satellatickets/ui': minor
'@satellatickets/core': minor
---

Fundamentos (Fase 2 del ROADMAP), con madurez `experimental`:

- `UIProvider` con la misma API en web y nativo (`theme`: light | dark | system, `brand`), anidable; hooks `useTheme`, `useColorScheme` y `useBrand`. En web pone `data-theme`/`data-brand` en un contenedor sin caja propia; en nativo entrega el tema por contexto.
- `Box` (relleno, fondo, radio, borde, sombra), `Stack` (dirección, separación, alineación), `Text` (diez variantes tipográficas con la escala de Satella) e `Icon` (iconos de lucide con `react-native-svg` en nativo, peer opcional).
- `core` publica los contratos y constantes de variantes de los cuatro componentes y el contexto de tema.
- Build de `ui` con doble salida y `styles.css` (CSS Modules compilados) para web.
