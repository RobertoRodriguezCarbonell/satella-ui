# ADR-018: Checklist de "componente terminado"

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Con dos vistas, dos catálogos y varios tipos de test, es fácil dar por terminado un componente al que le falta algo. Hace falta un criterio único, verificable y obligatorio, que sirva tanto a una persona como a Claude Code.

## Decisión

Un componente no está terminado hasta cumplir **todos** los puntos:

- [ ] Contrato tipado en `core`, con variantes exhaustivas en ambas vistas (`satisfies Record<…>`, ADR-014)
- [ ] Historias de todos los estados, incluidos `disabled`, `loading` y error cuando apliquen (ADR-012)
- [ ] Función `play` para cada interacción relevante (ADR-016)
- [ ] Cero violaciones de accesibilidad en todas las historias (ADR-016)
- [ ] Tests nativos con RNTL para las mismas interacciones (ADR-017)
- [ ] Referencias visuales generadas en CI y revisadas (ADR-016)
- [ ] Verificado en tema claro y oscuro, en Storybook web y nativo
- [ ] Exportado desde `packages/ui/src/index.ts`
- [ ] Changeset creado (ADR-021)
- [ ] CI en verde

La checklist vive en `CLAUDE.md` §8 y se incluye en la plantilla de pull request.

`Button` es el **componente de referencia** (ROADMAP Fase 3): se construye con especial cuidado porque todo lo demás lo copia.

## Alternativas descartadas

- **Revisión manual sin lista.** Depende de la memoria del revisor; no escala ni sirve a un agente.
- **Definition of done implícita en la CI.** La CI no puede comprobar "verificado en ambos Storybooks".

## Consecuencias

- Criterio objetivo para aceptar una PR.
- Claude Code tiene un criterio inequívoco para saber cuándo ha terminado una tarea.
