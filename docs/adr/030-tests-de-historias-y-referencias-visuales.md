# ADR-030: Tests de historias en `storybook-web`, dos temas y referencias visuales junto al componente

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-016 decide que las historias son los tests web (interacción, accesibilidad y regresión visual con `toMatchScreenshot`) y que las referencias se generan en CI. ADR-017 decide Jest + RNTL para nativo. Al implementarlo con `Button` (ROADMAP Fase 3) quedan por concretar varios detalles que condicionan a todos los componentes posteriores: dónde vive la configuración, en qué temas se ejecuta, dónde se guardan las capturas, cómo se regeneran y cómo se capturan los estados que solo existen como pseudo-clases CSS.

## Decisión

**Dónde se ejecuta.** La configuración de Vitest en modo navegador vive en `apps/storybook-web` (`vitest.config.ts`), junto a la configuración de Storybook que necesita `@storybook/addon-vitest`. `pnpm test:web` ejecuta ahí las historias de `packages/ui`. `packages/ui` no depende de ninguna app (ADR-002).

**Dos temas.** Cada historia se ejecuta dos veces, en un proyecto de Vitest por tema (`storybook-dark` y `storybook-light`, con el global `theme` fijado). La accesibilidad, que incluye el contraste, y la captura se comprueban así en ambos temas. Esto amplía "una captura por historia" de ADR-016 a una por historia y tema.

**Referencias junto al componente.** Las capturas se guardan en `packages/ui/src/<componente>/__screenshots__/<id-de-la-historia>-<tema>.png`. Se captura solo el contenedor de la historia, con un viewport de 1200 px de ancho. El nombre no lleva navegador ni plataforma porque solo existe un entorno válido: Chromium en `ubuntu-latest`.

**La comparación visual solo corre en CI.** En local, `pnpm test:web` ejecuta el render, las funciones `play` y axe, pero no compara capturas: las referencias generadas en Linux no coinciden con el renderizado de macOS o Windows. `VISUAL=on` la fuerza, para quien use un contenedor idéntico al de CI. La tolerancia es `threshold: 0.1` y 16 píxeles como máximo.

**Regeneración.** El workflow manual `visual-references.yml` ("Referencias visuales") borra las capturas, las vuelve a generar con `--update` y las deja como artefacto. En una rama de PR, además las sube como un commit y relanza la CI; en la rama por defecto no hace commit. Cuando la CI falla por una diferencia visual, sube la captura real y el diff como artefacto `diferencias-visuales`.

**Fuentes autoalojadas.** `storybook-web` carga las fuentes de Satella desde paquetes `@fontsource/*` en lugar del `<link>` a Google Fonts que describía ADR-027. Son los mismos ficheros, pero servidos por el propio Storybook: una captura no puede depender de la red. Antes de capturar se espera a `document.fonts.ready`. El resto de ADR-027 sigue vigente.

**Pseudo-estados.** Los estados que son pseudo-clases CSS (`:hover`, `:active`, `:focus-visible`, ADR-007) se documentan en historias solo web (`<Nombre>.web.stories.tsx`) con `parameters.pseudo`, usando el addon oficial `storybook-addon-pseudo-states`. Es el único addon añadido a la lista de ADR-013, y se justifica porque sin él esos estados no se pueden ver fijos en el catálogo ni capturar. Dentro de Vitest las historias no pasan por el ciclo de vida de Storybook que el addon espera, así que `vitest.setup.ts` aplica a mano sus dos pasos.

**Tests nativos.** `packages/ui` ejecuta Jest 29 con el preset `jest-expo` (la versión que acompaña a Expo SDK 56 y React Native 0.85) y React Native Testing Library 14. Los tests componen las historias con `composeStories` y comprueban las mismas interacciones que las funciones `play`. Un test de humo (`src/_testing/stories.native.test.tsx`) renderiza con las vistas nativas todas las historias compartidas.

## Alternativas descartadas

- **Configurar Vitest en `packages/ui` apuntando al `.storybook` de la app.** Invierte la dependencia entre capas y deja el panel de tests de Storybook sin configuración que leer.
- **Capturar solo el tema oscuro.** El producto es oscuro, pero la librería publica también el tema claro; la primera ejecución en ambos temas encontró un fallo de contraste que solo ocurría en claro.
- **Guardar las capturas en la app o con el nombre por defecto de Vitest.** Aleja la referencia del código que la produce y repite navegador y plataforma en cada nombre sin aportar nada.
- **Comparar capturas también en local.** Produciría fallos falsos en cualquier máquina que no sea Linux y empujaría a regenerar referencias fuera de CI.
- **Generar las referencias automáticamente en cada PR.** Un cambio visual no intencionado se aceptaría solo. Regenerar es una acción deliberada que deja un commit revisable.
- **Forzar los pseudo-estados con el protocolo de depuración de Chrome en los tests.** Es más fiel al motor, pero el catálogo seguiría necesitando el addon y habría dos mecanismos para lo mismo.

## Consecuencias

- Un cambio visual intencionado necesita dos pasos en su PR: el cambio y la regeneración de referencias con el workflow. El diff de imágenes se revisa como código.
- Actualizar Playwright cambia la versión de Chromium y puede obligar a regenerar todas las referencias; se hace en la misma PR de la actualización.
- El número de capturas es dos por historia. Si el repositorio crece demasiado, se puede limitar la captura a un tema o pasar a Git LFS sin cambiar los tests.
- Jest queda fijado a la versión que acompaña a `jest-expo`, y `test-renderer` a la que usa el reconciler de la versión de React fijada (ADR-024). Ambos se actualizan a mano junto con React Native.
