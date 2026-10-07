# ADR-009: Variantes como contrato tipado definido en `core`

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Para que `<Button variant="primary" size="md">` signifique lo mismo en web y en nativo, las variantes y las props deben definirse en un único lugar que ambas vistas importen.

## Decisión

Cada componente tiene su contrato en `packages/core/src/types/<nombre>.ts`:

```ts
export const buttonVariants = {
  variant: ['primary', 'secondary', 'ghost', 'danger'],
  size: ['sm', 'md', 'lg'],
} as const;

export type ButtonVariant = (typeof buttonVariants.variant)[number];
export type ButtonSize = (typeof buttonVariants.size)[number];

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
};
```

Reglas:

- Las constantes de variantes se exportan como **arrays `as const`**, no solo como tipos: las historias las usan para `argTypes` y para la matriz `AllVariants`.
- Las vistas importan el contrato; nunca lo redefinen ni lo extienden con props específicas de plataforma en el contrato común. Si una plataforma necesita una prop propia, se añade en `<Nombre>.types.ts` de `ui` como extensión explícita.
- Nombres de eventos neutrales (`onPress`, no `onClick`), que la vista web mapea a los eventos DOM.
- Diseño de API: variantes en lugar de estilos libres; composición antes que props gigantes; soporte de controlado/no controlado donde aplique; *escape hatches* limitados (`style` / `className`).

## Alternativas descartadas

- **Definir props en cada vista.** Divergencia inevitable entre plataformas.
- **Generar el contrato desde las historias.** Invierte la dependencia; las historias deben derivar del contrato.

## Consecuencias

- Añadir una variante en `core` rompe la compilación hasta que ambas vistas la implementen (ADR-014).
- `core` es publicable por sí solo: una app puede usar los hooks y tipos sin las vistas.
