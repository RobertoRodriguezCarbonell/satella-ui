# ADR-003: Monorepo con pnpm workspaces, Turborepo y Changesets

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

La librería se compone de varios paquetes publicables (ADR-002), dos catálogos visuales, apps de prueba y tooling compartido. Todo debe evolucionar junto, con versiones coherentes y builds rápidos.

## Decisión

- **pnpm workspaces** para gestionar los paquetes del monorepo. Los paquetes internos se referencian con `workspace:*`.
- **Turborepo** para orquestar `build`, `test`, `lint` y `typecheck`, con grafo de dependencias entre paquetes y caché local y remota. Solo se ejecuta lo afectado por un cambio.
- **Changesets** para versionado semántico y generación de `CHANGELOG.md` por paquete (detalle en ADR-021).

Estructura:

```
satella-ui/
├── apps/         storybook-web, storybook-native, playground-web, playground-native
├── packages/     tokens, core, icons, ui
├── tooling/      tsconfig, eslint-config, prettier-config
├── docs/adr/
├── .changeset/
├── turbo.json
└── pnpm-workspace.yaml
```

Los paquetes de `apps/` están en la lista `ignore` de Changesets: no se versionan ni publican.

## Alternativas descartadas

- **Repositorios separados por paquete.** Imposible mantener coherencia entre `tokens`, `core` y `ui` sin publicar constantemente.
- **Nx.** Más potente pero con más superficie de configuración; Turborepo cubre lo necesario con menos ceremonia.
- **npm/yarn workspaces.** Funcionan, pero pnpm aísla mejor las dependencias (evita *phantom dependencies*), que es especialmente importante en una librería con peers.

## Consecuencias

- Un solo `pnpm install` deja todo operativo.
- La caché remota de Turborepo acelera la CI de forma significativa.
- Requiere Node 22 y pnpm instalados en todas las máquinas y en CI (ADR-024).
