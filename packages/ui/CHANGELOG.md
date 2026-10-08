# @satellatickets/ui

## 0.1.0

### Minor Changes

- [`3dd5519`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/3dd5519e49a3175e597f71e5c8b8a4c870952aee) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Badge`, una etiqueta de estado con las variantes `success`, `warning`, `danger` e `info`. Cada una usa el fondo, el borde y el texto de su color de `color.feedback`, así que cambia con el tema y con la marca. Entra con madurez `experimental`. `core` publica el contrato `BadgeProps` y la constante `badgeVariants`.

- [`a5e8064`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a5e8064a7da9e29580cd976516f55cc05dfa7325) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Fundamentos (Fase 2 del ROADMAP), con madurez `experimental`:
  
  - `UIProvider` con la misma API en web y nativo (`theme`: light | dark | system, `brand`), anidable; hooks `useTheme`, `useColorScheme` y `useBrand`. En web pone `data-theme`/`data-brand` en un contenedor sin caja propia; en nativo entrega el tema por contexto.
  - `Box` (relleno, fondo, radio, borde, sombra), `Stack` (dirección, separación, alineación), `Text` (diez variantes tipográficas con la escala de Satella) e `Icon` (iconos de lucide con `react-native-svg` en nativo, peer opcional).
  - `core` publica los contratos y constantes de variantes de los cuatro componentes y el contexto de tema.
  - Build de `ui` con doble salida y `styles.css` (CSS Modules compilados) para web.

- [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - `Button`, el componente de referencia (Fase 3 del ROADMAP), y un `Spinner` mínimo. Ambos entran con madurez `experimental`.
  
  - `Button`: variantes `primary`, `secondary`, `ghost` y `danger`; tamaños `sm`, `md` y `lg`; `iconStart` e `iconEnd`; `fullWidth`; `disabled` y `loading`. Mientras carga no dispara `onPress`, pero conserva el foco, el nombre accesible y la anchura. En web es un `<button>` (`type="button"` por defecto) con hover, pulsado y anillo de foco en CSS; en nativo, un `Pressable` con su estado de accesibilidad y un área táctil mínima de 44 puntos.
  - `Spinner`: indicador de carga con la escala de tamaños de `Icon`; con `label` se anuncia como progreso indeterminado.
  - `core` publica los contratos `ButtonProps` y `SpinnerProps`, las constantes `buttonVariants`, `buttonIconSize` y `spinnerSizes`, y el hook `useButton`.
  - Corrección en web: un `Box` o un `Stack` anidado ya no hereda el relleno, el fondo, el borde, el radio, la sombra ni la separación del que lo contiene.

- [`873a07f`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/873a07f5f4dd638f9cffdfd8474788d8d4df2fe0) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Los tipos de props propios de cada plataforma se exportan solo donde existen: `ButtonWebProps`, `BoxWebProps`, `TextElement` y el resto de tipos `*WebProps` en la versión web; los `*NativeProps` en la de React Native. Los tipos comunes (`ButtonProps`, `BoxProps`…) no cambian. Antes, los tipos de la versión web importaban `react-native`, y el typecheck de una app web fallaba con `skipLibCheck: false`.
  
  El paquete incluye ahora un README con la instalación y el uso en cada plataforma.

### Patch Changes

- [`c4e9138`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/c4e9138ab13505b37bb26e55c22e1aa6314a8cf9) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Esqueleto inicial del monorepo (Fase 0 del ROADMAP): build con tsdown, TypeScript estricto, ESLint con reglas de fronteras entre capas, Vitest, Changesets y CI. Los paquetes todavía no exponen API pública.

- [`a9427c9`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a9427c967d87af04498fe7f90dea80abd8c01a06) Thanks [@RobertoRodriguezCarbonell](https://github.com/RobertoRodriguezCarbonell)! - Los tres paquetes incluyen el fichero de licencia MIT. `ui` incluye además `NOTICE.md`, con la licencia ISC de los iconos de Lucide que lleva dentro.
- Updated dependencies [[`3dd5519`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/3dd5519e49a3175e597f71e5c8b8a4c870952aee), [`c4e9138`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/c4e9138ab13505b37bb26e55c22e1aa6314a8cf9), [`4fb80d4`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/4fb80d4d0bcaf590018fb59000d7b2c273d11ca3), [`a5e8064`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a5e8064a7da9e29580cd976516f55cc05dfa7325), [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406), [`1100603`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/1100603bf8376871ef986b616c1f05341bed8406), [`a9427c9`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/a9427c967d87af04498fe7f90dea80abd8c01a06), [`873a07f`](https://github.com/RobertoRodriguezCarbonell/satella-ui/commit/873a07f5f4dd638f9cffdfd8474788d8d4df2fe0)]:
  - @satellatickets/core@0.1.0
  - @satellatickets/tokens@0.1.0
