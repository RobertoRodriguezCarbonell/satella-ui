# ADR-014: TypeScript estricto y mapas exhaustivos para garantizar paridad

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

La arquitectura híbrida (ADR-001) tiene un riesgo claro: que una variante o un estado se implemente en una vista y se olvide en la otra. Comprobarlo con tests es caro; comprobarlo con el compilador es gratis.

## Decisión

- `tsconfig` con `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` en todos los paquetes.
- Cada vista declara sus estilos por variante como un **mapa exhaustivo** validado con `satisfies`:

```ts
// Button.native.tsx
const variantStyles = {
  primary:   (t) => ({ backgroundColor: t.color.action.primary }),
  secondary: (t) => ({ backgroundColor: t.color.action.secondary }),
  ghost:     (t) => ({ backgroundColor: 'transparent' }),
  danger:    (t) => ({ backgroundColor: t.color.action.danger }),
} satisfies Record<ButtonVariant, (t: Theme) => ViewStyle>;
```

```ts
// Button.web.tsx — las clases CSS también se mapean de forma exhaustiva
const variantClass = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
} satisfies Record<ButtonVariant, string>;
```

- Los tokens generados exportan tipos (ADR-006); un token inexistente es un error de compilación.
- `typecheck` forma parte de `ci.yml` y del hook de pre-commit.

## Alternativas descartadas

- **Tests de paridad que recorran las variantes.** Más código, y solo detectan lo que el test comprueba.
- **`Record<Variant, …>` como anotación de tipo en lugar de `satisfies`.** Funciona, pero pierde la inferencia de los valores concretos; `satisfies` valida sin ensanchar el tipo.

## Consecuencias

- Añadir una variante en `core` rompe la compilación hasta que ambas vistas la implementen. La paridad es estructural.
- Ligero aumento de verbosidad en las vistas, compensado por la seguridad que aporta.
