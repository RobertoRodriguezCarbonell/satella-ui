# ADR-010: `UIProvider` con API única para tema y marca

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Las apps necesitan activar un tema (claro, oscuro o el del sistema) y opcionalmente una marca, con la misma API en web y nativo, sin conocer cómo se aplica por debajo (atributos CSS en web, contexto en nativo).

## Decisión

Un único componente `UIProvider` exportado desde `@satellatickets/ui`, con vista web y nativa:

```tsx
<UIProvider theme="system" brand="acme">
  <App />
</UIProvider>
```

| Prop | Valores | Web | Nativo |
|---|---|---|---|
| `theme` | `'light' \| 'dark' \| 'system'` (por defecto `'system'`) | Pone `data-theme` en su contenedor; `system` sigue `prefers-color-scheme` | Resuelve el tema desde `themes` y lo entrega por contexto; `system` usa `Appearance` |
| `brand` | nombre de marca registrada (opcional) | Pone `data-brand` | Combina los overrides de la marca sobre el tema |

Además:

- Hook `useTheme()` que devuelve el tema resuelto (en web, también útil para lógica condicional; en nativo, imprescindible para estilos).
- Hook `useColorScheme()` que devuelve `'light' | 'dark'` resuelto, para que las apps reaccionen al tema.
- Los providers pueden anidarse para zonas con otro tema (por ejemplo, un panel oscuro dentro de una app clara).

## Alternativas descartadas

- **Sin provider: que cada app ponga `data-theme` y gestione el contexto.** Duplica trabajo en cada app y rompe la promesa de una API única.
- **Un provider por plataforma con nombres distintos.** Obliga a las apps a importar cosas distintas según plataforma.

## Consecuencias

- Es la única pieza de configuración que una app necesita además de `styles.css` en web.
- Los Storybooks lo usan como decorador global (ADR-013).
- `UIProvider` es un *client component*; en Next.js con App Router se coloca en un `layout` cliente o se envuelve en `'use client'`.
