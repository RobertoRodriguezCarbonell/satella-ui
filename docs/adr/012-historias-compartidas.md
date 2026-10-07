# ADR-012: Historias compartidas en CSF con reglas multiplataforma

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Con dos Storybooks (ADR-011), escribir las historias dos veces duplicaría trabajo y las haría divergir. Storybook para React Native usa el mismo Component Story Format (CSF) que la versión web, lo que permite compartirlas si se respetan ciertas reglas.

## Decisión

Las historias se escriben **una vez**, en `packages/ui/src/<nombre>/<Nombre>.stories.tsx`, y ambos Storybooks las leen. Cada uno resuelve automáticamente la vista de su plataforma (ADR-004).

Reglas obligatorias para que una historia funcione en ambas plataformas:

1. **Solo componentes de la librería** dentro de las historias (`Stack`, `Box`, `Text`, `Icon`…). Nunca `div`, `span`, ni `View`/`Text` de React Native. Por eso las primitivas son la primera capa que se construye (ROADMAP Fase 2).
2. **Tipos desde un módulo interno**: `import type { Meta, StoryObj } from '../_storybook/types'`, que tiene `types.web.ts` (re-exporta de `@storybook/react`) y `types.native.ts` (re-exporta de `@storybook/react-native`).
3. **Texto como `children`** debe funcionar en ambas plataformas; la vista nativa lo envuelve en `<Text>` internamente.
4. **`argTypes` desde las constantes de `core`** (ADR-009), nunca listas escritas a mano.
5. Historias mínimas por componente: una por variante o estado relevante, una matriz `AllVariants`, y las de interacción con `play` (ADR-016).

Historias específicas de plataforma (un estado *hover* en web, un gesto en móvil) van en `<Nombre>.web.stories.tsx` o `<Nombre>.native.stories.tsx`. Son la excepción.

## Alternativas descartadas

- **Historias separadas por plataforma.** Duplicación y divergencia.
- **Historias solo web.** Deja la vista nativa sin especificación visual ni smoke test.

## Consecuencias

- Las historias actúan como **especificación** del componente: se escriben antes de implementar (CLAUDE.md §7).
- Las historias web se convierten en tests automáticamente (ADR-016) y los tests nativos reutilizan sus `args` (ADR-017).
