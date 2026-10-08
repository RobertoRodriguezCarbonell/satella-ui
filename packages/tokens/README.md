# @satellatickets/tokens

Design tokens de satella-ui en formato [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/), con salidas para web (variables CSS) y React Native (objetos de tema tipados). Es la base de `@satellatickets/ui` y puede usarse solo (emails, documentación, otros proyectos).

## Uso

```ts
// Web: variables CSS, una vez por app
import '@satellatickets/tokens/tokens.css';
// Temas por atributo: <html data-theme="dark" data-brand="acme">

// Web o React Native: temas resueltos y tipos
import { themes, brands, type Theme, type TokenName } from '@satellatickets/tokens';
const t: Theme = themes.light;
t.color.action.primary; // "#6c4cf5"
t.space[4]; // 16
```

En las apps, `UIProvider` de `@satellatickets/ui` se encarga de aplicar tema y marca (ADR-010).

## Estructura

```
src/
├── primitives/      paleta (`palette.*`, nunca se emite) y escalas: space, radius, font, shadow, duration, zIndex
├── semantic/        light.tokens.json y dark.tokens.json: `color.*` con significado de uso
├── brands/          overrides por marca (ver brands/README.md)
├── contrast-pairs.json   parejas texto/fondo que deben cumplir WCAG AA
└── pipeline/        build: Style Dictionary v5 + conversores propios
build.ts             genera dist/ (ver abajo)
schemas/dtcg/2025.10 JSON Schema oficial, para validar los ficheros en los tests
```

Tres niveles (ADR-005): los componentes consumen **solo** tokens emitidos (`color.bg.surface`, `space.4`, `radius.md`…), nunca `palette.*` ni valores literales.

La paleta y la capa semántica oscura reproducen el producto real (`staging.satellatickets.com`): acento violeta `#6c4cf5`, grises "ink", feedback mint/ámbar/coral/cian, fuentes Unbounded (titulares), Hanken Grotesk (texto) e IBM Plex Mono (etiquetas). El producto no tiene tema claro: el tema `light` es una propuesta con los mismos matices, verificada con las mismas parejas de contraste. Cada token de `palette.*` indica en su `$description` de qué variable de Satella procede o cómo se ha derivado. Las marcas `admin` y `organizer` viven en `src/brands/` (ver su README).

Además de color, tipografía, espaciado, radios y sombras, hay dos escalas pensadas para los controles: `size.control.{sm,md,lg}` (altura de botones y campos: 36, 44 y 52 px) y `borderWidth.{thin,thick}` (1 y 2 px; `thick` es el anillo de foco). Los componentes las usan en lugar de valores literales (ADR-005).

## Salidas (`pnpm build`)

| Fichero                 | Contenido                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `dist/web/tokens.css`   | `:root, [data-theme="light"]` con todos los tokens; `[data-theme="dark"]` solo con lo que cambia; un bloque `[data-brand="…"]` por marca |
| `dist/native/themes.ts` | `themes.light`, `themes.dark`, `brands` (overrides por marca y tema), `themeNames`, `brandNames`, `tokenNames`, `cssVariables`           |
| `dist/types.ts`         | `Theme`, `ThemeOverrides`, `ThemeName`, `BrandName`, `TokenName`, `CssVariableName`, `BoxShadow`, `FontWeight`                           |
| `dist/index.js`         | Compilación de `src/index.ts`, que reexporta los dos anteriores                                                                          |

`pnpm dev` deja `build.ts` en modo watch sobre `src/`.

## Reglas de conversión

| Tipo DTCG    | CSS                                                                                    | React Native                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `color`      | `#rrggbb`, o `#rrggbbaa` si tiene alpha                                                | igual                                                                                                                           |
| `dimension`  | px → rem (÷16); `$extensions["com.satellatickets.tokens"].css.unit = "px"` mantiene px | número en puntos (rem × 16)                                                                                                     |
| `fontFamily` | pila completa, con comillas donde hace falta                                           | primera familia; `undefined` (fuente del sistema) si la pila empieza por una genérica; la extensión `native.fontFamily` la fija |
| `fontWeight` | número                                                                                 | cadena (`"600"`)                                                                                                                |
| `duration`   | con su unidad (`200ms`)                                                                | milisegundos                                                                                                                    |
| `number`     | tal cual                                                                               | tal cual                                                                                                                        |
| `shadow`     | `box-shadow`, en px                                                                    | array `boxShadow` de la Nueva Arquitectura                                                                                      |

Solo se soporta el espacio de color `srgb`; cada color lleva `hex` de respaldo y el test comprueba que coincide con los componentes.

## Añadir o cambiar tokens

1. Edita el `*.tokens.json` correspondiente. Un token semántico de color nuevo se añade a **los dos** temas; si falta en uno, el build falla.
2. Si es un color de texto o de interfaz, añade su pareja a `contrast-pairs.json`.
3. `pnpm test` (esquema DTCG, completitud, contraste, salidas) y `pnpm build`.
4. Changeset: renombrar o eliminar un token semántico es breaking (ADR-025); un token nuevo es `minor`.

## Tests

- **DTCG**: cada fichero valida contra el JSON Schema oficial de la 2025.10.
- **Completitud**: todos los temas definen los mismos tokens; cada marca cubre todos los tokens de cada tema sin inventar ninguno.
- **Contraste**: cada pareja de `contrast-pairs.json` cumple AA (4.5:1 texto, 3:1 interfaz) en todos los temas y marcas.
- **Salidas**: la forma de los tres ficheros generados, con una marca de ejemplo que vive solo en los fixtures de test.
