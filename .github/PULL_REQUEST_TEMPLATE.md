## Qué cambia

<!-- Qué cambia y por qué. Si es breaking (ADR-025), cómo migrar. -->

## Checklist

- [ ] Changeset creado (`pnpm changeset`), con el tipo según ADR-021 / ADR-025
- [ ] CI en verde

### Si la PR añade o cambia un componente (CLAUDE.md §8, ADR-018)

- [ ] Contrato tipado en `core`, con variantes exhaustivas en ambas vistas (`satisfies Record<…>`)
- [ ] Historias de todos los estados, incluidos `disabled`, `loading` y error cuando apliquen
- [ ] Función `play` para cada interacción relevante
- [ ] Cero violaciones de accesibilidad en todas las historias
- [ ] Tests nativos con React Native Testing Library para las mismas interacciones
- [ ] Referencias visuales generadas en CI y revisadas
- [ ] Verificado en tema claro y oscuro, en Storybook web y nativo
- [ ] Exportado desde `packages/ui/src/index.ts`
