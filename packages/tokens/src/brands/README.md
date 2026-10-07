# Marcas

Una marca redefine un subconjunto de tokens semánticos (color principal, radios, tipografía…) sin tocar ningún componente (ADR-005). La carpeta existe desde el principio aunque esté vacía.

## Estructura

```
brands/
└── acme/
    ├── brand.tokens.json   # overrides comunes a todos los temas
    ├── light.tokens.json   # (opcional) overrides solo para el tema claro
    └── dark.tokens.json    # (opcional) overrides solo para el tema oscuro
```

- El nombre de la carpeta es el nombre de la marca (`data-brand="acme"` en web, `brand="acme"` en `UIProvider`).
- Un fichero de marca solo puede **sobrescribir tokens que ya existen** en la capa base (`color.action.primary`, `radius.md`…). Si introduce un token semántico nuevo, el build falla.
- Puede definir entradas privadas en `palette.*` (por ejemplo `palette.violet.600`) y referenciarlas desde sus overrides. `palette.*` nunca se emite.
- Las parejas de `contrast-pairs.json` se comprueban también para cada marca en cada tema: si el color principal de la marca no cumple AA con `text.onAction`, la marca debe sobrescribir también `text.onAction` (o usar `dark.tokens.json` para ajustar el tema oscuro).

## Salidas

- `dist/web/tokens.css`: un bloque `[data-brand="acme"]` con los tokens que cambian respecto al tema claro y, solo si hace falta, un bloque `[data-theme="dark"][data-brand="acme"]` con los que cambian respecto al tema oscuro.
- `dist/native/themes.ts`: `brands.acme.light` y `brands.acme.dark` con los overrides, que `UIProvider` combina sobre el tema activo (ADR-010).
- `dist/types.ts`: `BrandName` incluye `'acme'`.

El pipeline se prueba con una marca de ejemplo que vive solo en los tests (`src/__tests__/fixtures/brands/demo`), para no publicar marcas de muestra.
