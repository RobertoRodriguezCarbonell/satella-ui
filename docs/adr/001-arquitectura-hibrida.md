# ADR-001: Librería compartida React + React Native con arquitectura híbrida

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Se necesita una única librería de componentes consumible por aplicaciones React (web, principalmente Next.js) y React Native. React y React Native comparten el modelo de componentes, props y hooks, pero no las primitivas de renderizado (`div` frente a `View`), el sistema de estilos (CSS frente a objetos `StyleSheet`), el modelo de eventos ni las APIs de accesibilidad. La decisión central es cuánto código compartir y por qué mecanismo.

## Decisión

Arquitectura **híbrida**:

- Se comparte al 100 %: design tokens, tipos y contratos de props, constantes de variantes, lógica headless (hooks) y utilidades.
- El renderizado es **específico por plataforma**: cada componente tiene una vista web (`*.web.tsx`, HTML semántico + CSS) y una vista nativa (`*.native.tsx`, primitivas de React Native), detrás de una única importación pública.
- Las apps consumen una sola API: `import { Button } from '@satellatickets/ui'`. El bundler de cada plataforma (Metro en nativo, Vite/Turbopack/webpack en web) resuelve la implementación correcta.

## Alternativas descartadas

- **Dos librerías independientes.** Máxima simplicidad por paquete, pero duplicación total y divergencia inevitable entre web y móvil.
- **Universal con `react-native-web`.** Comparte el máximo de código, pero la web pierde control sobre el HTML semántico y el CSS, y queda atada al modelo de React Native; peor integración con SSR y Server Components.
- **Universal con React Strict DOM.** Enfoque prometedor (API web que se lleva a nativo), pero en el momento de la decisión sigue en versiones `0.0.x` y con compatibilidad con React Native incompleta. No es base para una librería que debe durar años.
- **Construir sobre un kit universal (gluestack, Tamagui…).** Arranque rápido a cambio de heredar sus decisiones y migraciones; sus versiones recientes no cubren bien Next.js.

## Consecuencias

- Se escriben dos vistas por componente. La parte difícil (lógica, estados, accesibilidad) se escribe una vez; las vistas suelen ser finas.
- Cada plataforma rinde al máximo: HTML y CSS reales en web, componentes nativos en móvil.
- La API pública es independiente de la implementación: si React Strict DOM madura, se puede migrar componente a componente sin tocar a las apps.
- La paridad entre vistas no se garantiza sola; la impone el sistema de tipos (ADR-014) y la checklist de componente (ADR-018).
