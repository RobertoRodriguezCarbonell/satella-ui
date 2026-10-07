# ADR-004: Convención de ficheros por componente y resolución por plataforma

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Cada componente tiene dos vistas (ADR-001) más historias, tests y tipos. Hace falta una estructura única que los bundlers resuelvan automáticamente y que cualquier persona (o Claude Code) pueda replicar sin ambigüedad.

## Decisión

Cada componente vive en `packages/ui/src/<nombre>/`:

```
button/
├── Button.types.ts          # re-exporta/extiende el contrato de core
├── Button.web.tsx           # vista web
├── Button.module.css        # estilos web
├── Button.native.tsx        # vista React Native
├── Button.stories.tsx       # historias compartidas
├── Button.web.stories.tsx   # (opcional) historias solo web
├── Button.native.stories.tsx# (opcional) historias solo nativo
├── Button.native.test.tsx   # tests nativos
├── README.mdx               # (opcional) documentación para Storybook
└── index.ts                 # export público
```

Resolución por plataforma:

- **Metro** (React Native) resuelve `.native.tsx` antes que `.tsx` por defecto.
- **Vite** (Storybook web, tests web) se configura con `resolve.extensions` para preferir `.web.tsx`.
- En el paquete publicado, cada build (ADR-019) ya ha resuelto su plataforma, así que las apps no necesitan configurar nada.

Reglas:

- `index.ts` exporta desde un nombre sin sufijo (`./Button`), nunca directamente desde `.web` o `.native`.
- Un componente sin diferencia de plataforma (lógica pura, wrappers) puede tener un único `*.tsx`, pero es la excepción.

## Alternativas descartadas

- **Carpetas `web/` y `native/` paralelas.** Separa físicamente lo que conceptualmente es un solo componente; dificulta ver de un vistazo si las dos vistas están al día.
- **`Platform.select` dentro de un único fichero.** Mezcla imports de `react-dom` y `react-native` en el mismo módulo; el tree-shaking no puede eliminar la plataforma no usada.

## Consecuencias

- Estructura predecible: añadir un componente es copiar la de `Button`.
- Los bundlers hacen el trabajo; no hay capa de indirección en runtime.
