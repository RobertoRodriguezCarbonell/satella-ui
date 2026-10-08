import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Las historias son los tests web (ADR-016): cada una se renderiza en Chromium,
 * ejecuta su función `play` y pasa por axe. Se ejecutan dos veces, una por tema.
 *
 * La comparación visual solo se activa en CI (o con VISUAL=on): las referencias se
 * generan allí y no coinciden con el renderizado de otro sistema operativo (ADR-030).
 */
const visual = process.env.VISUAL ? process.env.VISUAL !== 'off' : Boolean(process.env.CI);

/**
 * Si VISUAL_MANIFEST apunta a un fichero, se anota en él cada referencia que piden los
 * tests. El workflow "Referencias visuales" lo usa para borrar las capturas que ya no
 * corresponden a ninguna historia.
 */
const manifest = process.env.VISUAL_MANIFEST;

/**
 * Desde la terminal y en CI hay un proyecto por tema. Cuando los tests se lanzan desde el
 * panel de Storybook (VITEST_STORYBOOK), el addon da a cada proyecto el nombre de su carpeta
 * de configuración: dos proyectos chocarían y Vitest no arrancaría, así que ahí solo se
 * ejecuta el tema oscuro, el del producto.
 */
const fromStorybookUi = process.env.VITEST_STORYBOOK === 'true';
const themes = fromStorybookUi ? (['dark'] as const) : (['dark', 'light'] as const);

export default defineConfig({
  test: {
    projects: themes.map((theme) => ({
      extends: true,
      plugins: [
        storybookTest({
          configDir: path.join(dirname, '.storybook'),
          storybookScript: 'pnpm dev',
          initialGlobals: { theme },
        }),
      ],
      test: {
        name: `storybook-${theme}`,
        provide: { visual, theme },
        setupFiles: ['./.storybook/vitest.setup.ts'],
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
          expect: {
            toMatchScreenshot: {
              comparatorName: 'pixelmatch',
              // Tolerancia pequeña pero no cero, para absorber el antialiasing (ADR-016).
              comparatorOptions: { threshold: 0.1, allowedMismatchedPixels: 16 },
              // Una referencia por historia y tema, junto a su componente:
              // packages/ui/src/<componente>/__screenshots__/<historia>-<tema>.png
              resolveScreenshotPath: ({
                arg,
                ext,
                root,
                screenshotDirectory,
                testFileDirectory,
              }) => {
                const file = path.resolve(
                  root,
                  testFileDirectory,
                  screenshotDirectory,
                  `${arg}${ext}`,
                );
                if (manifest) appendFileSync(manifest, `${file}\n`);
                return file;
              },
              // Captura real y diff de un test fallido: apps/storybook-web/.vitest/attachments/visual/
              resolveDiffPath: ({ arg, attachmentsDir, ext, root }) =>
                path.resolve(root, attachmentsDir, 'visual', `${arg}${ext}`),
            },
          },
        },
      },
    })),
  },
});
