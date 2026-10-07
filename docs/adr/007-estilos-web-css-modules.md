# ADR-007: Estilos web con CSS Modules y variables CSS

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Las vistas web (`*.web.tsx`) necesitan un sistema de estilos que consuma los tokens (ADR-006), funcione con SSR y Server Components de Next.js, no imponga dependencias a las apps consumidoras y permita cambiar de tema sin coste.

## Decisión

**CSS Modules + variables CSS**, compilados en el build de `ui` a un único `styles.css` estático que la app importa una vez (`import '@satellatickets/ui/styles.css'`).

```tsx
// Button.web.tsx
import styles from './Button.module.css';
<button className={cx(styles.base, styles[variant], styles[size])} />
```

```css
/* Button.module.css */
.primary { background: var(--color-action-primary); }
.md      { padding: var(--space-2) var(--space-4); }
```

Reglas:

- Solo se usan variables CSS de tokens; nunca valores literales.
- Los temas y marcas se aplican por atributo (`data-theme`, `data-brand`) en un contenedor; las variables hacen el resto. Pueden anidarse zonas con otro tema.
- Estados interactivos (`:hover`, `:focus-visible`, `:disabled`) en CSS, no en JS.

## Alternativas descartadas

- **CSS-in-JS en runtime (styled-components, Emotion).** Coste en runtime, problemas con Server Components, dependencia impuesta a la app.
- **Tailwind.** Obligaría a cada app a tener Tailwind configurado con el mismo preset; acopla la librería a la configuración del consumidor.
- **vanilla-extract / StyleX.** Buenas opciones de zero-runtime, pero añaden una herramienta de build propia que las apps o Storybook deben conocer; CSS Modules es estándar en todos los bundlers.

## Consecuencias

- Cero coste en runtime; cambiar de tema no re-renderiza nada.
- Compatible con SSR, RSC y cualquier bundler.
- La app debe importar `styles.css` una vez (documentado en el README del paquete).
- El `sideEffects` del `package.json` debe incluir `*.css` para que no se elimine en tree-shaking (ADR-019).
