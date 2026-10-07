# ADR-016: Las historias son los tests web: interacción, a11y y regresión visual

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Cada componente ya tiene historias que cubren todos sus estados (ADR-012). Reescribir esos mismos casos como tests sería duplicación. Vitest 4 estabilizó su modo navegador e incluye regresión visual nativa, y el addon de Vitest de Storybook convierte cada historia en un test.

## Decisión

Para la vista web, **las historias son los tests**, ejecutadas con `@storybook/addon-vitest` en Vitest modo navegador (provider Playwright, Chromium):

1. **Smoke test automático**: toda historia que no renderice o lance un error falla. Sin código extra.
2. **Interacción**: funciones `play` en las historias que lo requieran, con `userEvent` y `expect` del addon:

   ```tsx
   export const ClickDisparaOnPress: Story = {
     args: { onPress: fn() },
     play: async ({ args, canvas, userEvent }) => {
       await userEvent.click(canvas.getByRole('button', { name: 'Guardar' }));
       await expect(args.onPress).toHaveBeenCalledOnce();
     },
   };
   ```

3. **Accesibilidad bloqueante**: el addon A11y (axe) se ejecuta en cada historia durante los tests; cualquier violación hace fallar el test, no solo avisa.
4. **Regresión visual**: `toMatchScreenshot` de Vitest 4 captura cada historia y la compara píxel a píxel con una imagen de referencia versionada en el repositorio. Sin servicios externos.

Reglas para las referencias visuales:

- Se generan **siempre en CI** (o en un contenedor Docker idéntico al de CI), nunca en local, porque el renderizado de fuentes varía entre sistemas operativos.
- Un cambio visual intencionado se acepta regenerando las referencias en una PR; el diff de imágenes se revisa como parte del código.
- Umbral de diferencia pequeño pero no cero, para absorber antialiasing.

## Alternativas descartadas

- **Tests de componente separados con Testing Library en jsdom.** Duplican las historias y jsdom no renderiza CSS real, así que no sirven para a11y de contraste ni para visual.
- **Chromatic / Percy / Argos.** Excelentes, pero son servicios de pago y añaden una dependencia externa. Se pueden incorporar más adelante si el volumen de referencias lo justifica.

## Consecuencias

- Escribir una historia es escribir un test. El coste marginal del testing web es casi cero.
- CI necesita Playwright con Chromium instalado.
- Las referencias visuales ocupan espacio en el repositorio; se mantienen pequeñas (viewport fijo, una captura por historia).
