---
'@satellatickets/tokens': minor
---

Primera versión de los tokens (Fase 1 del ROADMAP): paleta y escalas primitivas (`space`, `radius`, `font`, `shadow`, `duration`, `zIndex`), capa semántica de color para los temas claro y oscuro (`color.bg.*`, `color.text.*`, `color.border.*`, `color.action.*`, `color.feedback.*`) en formato DTCG 2025.10, y build con Style Dictionary v5 que genera `tokens.css` (bloques por tema y marca), `themes.ts` para React Native y los tipos `Theme`, `TokenName` y `BrandName`. Incluye tests de esquema DTCG, completitud entre temas y marcas, y contraste WCAG AA.
