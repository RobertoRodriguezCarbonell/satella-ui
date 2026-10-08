# ADR-031: Publicación: arranque manual, release por jobs y comprobación de paquetes

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-022 decide publicar con trusted publishing desde `release.yml`, sin tokens. Al preparar la primera publicación (ROADMAP Fase 4) aparecen tres hechos que ese ADR no cubre:

1. npm solo permite configurar un trusted publisher en un paquete que **ya existe** en el registro. La primera versión de cada paquete no puede publicarse con OIDC.
2. La action de Changesets v2 recomienda, con trusted publishing, usar sus subacciones en jobs separados para que el permiso `id-token: write` no esté disponible mientras se ejecuta código del proyecto.
3. `publint` valida la forma del paquete, pero no que una app pueda usarlo. La primera prueba de consumo real encontró que los tipos de la versión web importaban `react-native` (ADR-032).

## Decisión

**Arranque, una sola vez por paquete.** Un mantenedor publica a mano, desde su máquina y con su sesión de npm, la versión `0.0.0` de los tres paquetes. Es la única excepción a "no publicar a mano" (CLAUDE.md §11) y no contiene nada que las apps deban usar: se marca como obsoleta. Después se configura el trusted publisher de cada paquete, con el permiso `npm publish`, y se fusiona la PR "Version Packages": la `0.1.0`, y todas las siguientes, las publica la CI con procedencia. El procedimiento está en `docs/publicacion.md`. No existe ningún `NPM_TOKEN`, tampoco durante el arranque.

**`release.yml` en cuatro jobs**, con permisos mínimos cada uno:

| Job | Qué hace | Permisos |
|---|---|---|
| `select-mode` | Decide si toca versionar o publicar | `contents: read` |
| `version` | Crea o actualiza la PR "Version Packages" | `contents: write`, `pull-requests: write` |
| `pack` | Compila, ejecuta `pnpm check:packages` y empaqueta los `.tgz` | `contents: read` |
| `publish` | Publica esos `.tgz` y crea etiquetas y releases | `contents: write`, `id-token: write` |

El job que tiene acceso a OIDC no compila ni ejecuta scripts del proyecto: publica lo que `pack` dejó como artefacto. Los jobs de release no usan la caché del gestor de paquetes.

**Comprobación de paquetes.** `pnpm check:packages` (`scripts/check-packages.mjs`) empaqueta `tokens`, `core` y `ui`, pasa `publint --strict` a cada `.tgz` y hace una prueba de consumo: copia `tests/consumer-web` fuera del monorepo, instala los `.tgz` con npm y comprueba tipos sin `skipLibCheck`, build con Vite, render en servidor y resolución de la condición `react-native`. Se ejecuta en `ci.yml` después del build y en el job `pack` antes de publicar.

**Storybook público.** `storybook.yml` compila `storybook-web` en cada push a `main` y lo despliega en GitHub Pages.

## Alternativas descartadas

- **Token granular de un solo uso para la primera publicación.** Obliga a guardar un secreto en el repositorio, justo lo que ADR-022 evita, y los tokens que saltan el 2FA están en retirada.
- **Publicar a mano directamente la `0.1.0`.** Saldría sin procedencia, y al fusionar la PR de versiones `release.yml` intentaría publicarla y fallaría.
- **La action combinada `changesets/action`.** Da `id-token: write` al mismo job que instala dependencias y compila.
- **Solo `publint`.** No habría detectado el fallo de tipos entre plataformas.

## Consecuencias

- Sustituye, en ADR-022, la frase sobre configurar el trusted publisher antes de la primera publicación; el resto sigue vigente.
- En npm quedará una versión `0.0.0` obsoleta de cada paquete.
- Un trusted publisher recién creado caduca si no publica en dos días: se configura justo antes de fusionar la PR de versiones.
- La prueba de consumo necesita red para instalar las dependencias de la app de prueba y añade menos de un minuto a la CI.
