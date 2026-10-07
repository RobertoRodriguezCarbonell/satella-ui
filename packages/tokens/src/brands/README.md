# Marcas

Una marca redefine un subconjunto de tokens semánticos (color principal, grises, radios, resplandor…) sin tocar ningún componente (ADR-005).

## Marcas de Satella

El producto tiene tres identidades, tomadas de `staging.satellatickets.com`:

| Marca           | Dónde se usa                               | Acento                          | Grises             | Otros                                            |
| --------------- | ------------------------------------------ | ------------------------------- | ------------------ | ------------------------------------------------ |
| _(por defecto)_ | Web pública (`:root`)                      | violeta `#6c4cf5`               | ink (azulados)     |                                                  |
| `admin`         | Panel de administración (`.theme-admin`)   | verde `#7fee64`, texto oscuro   | graphite (neutros) | radios más cerrados (6/8/12 px), feedback propio |
| `organizer`     | Área de organizadores (`.theme-organizer`) | naranja `#f9791f`, texto oscuro | sand (cálidos)     | aviso amarillo `#ffdf57`                         |

Las dos marcas solo definen `dark.tokens.json`, porque el producto solo tiene tema oscuro: en el tema claro caen a los valores por defecto (violeta).

## Estructura

```
brands/
└── acme/
    ├── brand.tokens.json   # overrides comunes a todos los temas
    ├── light.tokens.json   # (opcional) overrides solo para el tema claro
    └── dark.tokens.json    # (opcional) overrides solo para el tema oscuro
```

- El nombre de la carpeta es el nombre de la marca (`data-brand="admin"` en web, `brand="admin"` en `UIProvider`).
- Un fichero de marca solo puede **sobrescribir tokens que ya existen** en la capa base (`color.action.primary`, `radius.md`…). Si introduce un token semántico nuevo, el build falla.
- Puede definir entradas privadas en `palette.*` (por ejemplo `palette.lime.500`) y referenciarlas desde sus overrides; `palette.*` nunca se emite. Para un valor suelto puede escribir el color inline.
- Las parejas de `contrast-pairs.json` se comprueban también para cada marca en cada tema: si el color principal de la marca no cumple AA con `text.onPrimary`, la marca debe sobrescribir también `text.onPrimary` (admin y organizer usan texto oscuro sobre su acento por eso).

## Salidas

- `dist/web/tokens.css`: un bloque `[data-brand="x"]` con lo que la marca cambia en el tema claro y un bloque `[data-theme="dark"][data-brand="x"]` con lo que cambia en el oscuro (calculado por cascada: solo lo necesario).
- `dist/native/themes.ts`: `brands.x.light` y `brands.x.dark` con los overrides, que `UIProvider` combina sobre el tema activo (ADR-010).
- `dist/types.ts`: `BrandName` incluye cada marca.

Además de las marcas reales, los tests usan una marca de ejemplo (`demo`, en `src/__tests__/fixtures/brands/demo`) con overrides en los dos temas, para cubrir el camino de `brand.tokens.json` + `dark.tokens.json`.
