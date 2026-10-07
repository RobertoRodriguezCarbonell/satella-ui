---
'@satellatickets/tokens': minor
---

Primera versión de los tokens (Fase 1 del ROADMAP), con la identidad real de Satella: paleta y escalas primitivas (`space`, `radius`, `font` con Unbounded, Hanken Grotesk e IBM Plex Mono, `shadow` con resplandor de acento, `duration`, `zIndex`), capa semántica de color para el tema oscuro del producto y un tema claro equivalente (`color.bg.*`, `color.text.*`, `color.border.*`, `color.action.*`, `color.accent.*`, `color.feedback.*`), y las marcas `admin` y `organizer`. Formato DTCG 2025.10 y build con Style Dictionary v5 que genera `tokens.css` (bloques por tema y marca), `themes.ts` para React Native y los tipos `Theme`, `TokenName` y `BrandName`. Incluye tests de esquema DTCG, completitud entre temas y marcas, y contraste WCAG AA.
