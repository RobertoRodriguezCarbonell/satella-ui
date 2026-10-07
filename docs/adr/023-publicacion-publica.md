# ADR-023: Publicación pública en npm bajo `@satellatickets`

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Hay que decidir si el repositorio y los paquetes son públicos o privados. En npm, los paquetes privados requieren un plan de pago; el trusted publishing (ADR-022) requiere repositorio público. GitHub Packages ofrece un registro npm privado gratuito con 500 MB para repositorios privados.

## Decisión

- **Repositorio público** en GitHub y **paquetes públicos** en npm, bajo la organización `satellatickets`: `@satellatickets/tokens`, `@satellatickets/core`, `@satellatickets/ui`.
- Storybook web desplegado públicamente como documentación y escaparate.
- La librería **no contiene nada específico de un cliente ni de un producto concreto**. Lo que es específico vive en la app que lo necesita. Esto es condición para que sea pública y, además, buena práctica de diseño.

**Migración futura a privado**, si se decide, con tres cambios y sin tocar código:

1. Repositorio a privado.
2. `publishConfig.registry` de cada paquete apuntando a GitHub Packages (`https://npm.pkg.github.com`).
3. `release.yml` autenticando con el `GITHUB_TOKEN` del propio workflow en lugar de OIDC (se pierde provenance). Las apps consumidoras necesitarán un `.npmrc` apuntando al registro.

Para que esa migración sea trivial: scope propio desde el día uno (el nombre no cambia al migrar), el registro se configura en un único sitio (`publishConfig`), y nada en el código asume que es público.

## Alternativas descartadas

- **npm Pro (7 $/mes) con paquetes privados.** Coste recurrente sin necesidad actual; sin trusted publishing.
- **GitHub Packages privado desde el inicio.** Gratuito, pero sin provenance, con fricción de `.npmrc` en cada app y sin el valor de portfolio de un repositorio público.

## Consecuencias

- Cero coste de registro.
- La librería es pieza visible de portfolio.
- El scope `satellatickets` pertenece a un proyecto concreto, pero la librería es genérica: el nombre del paquete (`ui`, `core`, `tokens`) no la ata a ese producto.
