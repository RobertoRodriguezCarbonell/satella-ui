# ADR-013: Decorador global de tema y addons iniciales

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Las historias deben verse con los tokens reales y en todos los temas, y el catálogo debe ayudar a detectar problemas (accesibilidad, eventos) mientras se desarrolla.

## Decisión

**Decorador global** en ambos Storybooks que envuelve cada historia en `<UIProvider>` (ADR-010):

- `storybook-web`: selector de tema (claro/oscuro) y de marca en la toolbar, con un `globalType` que el decorador lee.
- `storybook-native`: el mismo control desde el panel de addons on-device.

**Addons iniciales:**

| Addon | Para qué | Dónde |
|---|---|---|
| Controls | Cambiar props en vivo | Ambos |
| Actions | Log de eventos (`onPress`…) | Ambos |
| Docs (autodocs) | Página de documentación generada por componente | Web |
| A11y | Auditoría de accesibilidad (axe) por historia | Web |
| Vitest | Ejecutar las historias como tests desde el panel (ADR-016) | Web |

## Alternativas descartadas

- **Sin decorador: que cada historia envuelva su propio provider.** Repetitivo y fácil de olvidar.
- **Addon de temas de terceros.** Innecesario: `UIProvider` ya resuelve el cambio de tema.

## Consecuencias

- Un componente que se ve mal en modo oscuro se detecta en el momento.
- Las violaciones de accesibilidad aparecen en el panel mientras se desarrolla, no cuando ya está publicado.
- Cualquier addon adicional requiere justificación; mantener la lista corta reduce la fricción al actualizar Storybook.
