/**
 * Test de humo nativo: todas las historias compartidas se renderizan con las vistas
 * `.native.tsx` sin lanzar errores. Es el equivalente al que el addon de Vitest hace
 * en web con cada historia (ADR-016), y detecta, por ejemplo, texto fuera de `<Text>`.
 */
import fs from 'node:fs';
import path from 'node:path';

import { composeStories } from '@storybook/react';
import { screen, userEvent } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import { renderWithProvider } from './render';

const SRC = path.resolve(__dirname, '..');

/** Una historia compuesta: el componente y los args con los que se renderiza. */
type ComposedStory = ComponentType<{ testID?: string }> & { args?: Record<string, unknown> };

/** El fondo de un diálogo no es un control para los lectores de pantalla. */
const HIDDEN = { includeHiddenElements: true } as const;

/** Historias compartidas y `.native.stories`; las `.web.stories` son solo del Storybook web. */
function storyFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return storyFiles(full);
    return /\.stories\.tsx?$/.test(entry.name) && !/\.web\.stories\./.test(entry.name)
      ? [full]
      : [];
  });
}

const files = storyFiles(SRC).sort();

describe('historias en nativo', () => {
  it('encuentra las historias de todos los componentes', () => {
    expect(files.length).toBeGreaterThanOrEqual(7);
  });

  describe.each(files.map((file) => [path.relative(SRC, file), file] as const))(
    '%s',
    (_name, file) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const csf = require(file) as Parameters<typeof composeStories>[0];
      const composed = composeStories(csf) as Record<string, ComposedStory>;

      it.each(Object.entries(composed))('%s se renderiza', async (_story, Story) => {
        await renderWithProvider(<Story />);

        expect(screen.toJSON()).not.toBeNull();
      });

      // Un diálogo abierto tapa la pantalla entera, también la navegación del Storybook del
      // dispositivo, que además vuelve a la última historia cada vez que se abre. Si la
      // historia deja `open` fijo en sus args, no hay forma de salir de ella: tiene que
      // guardarlo en su estado, como haría una app.
      const opened = Object.entries(composed).filter(([, Story]) => Story.args?.open === true);
      if (opened.length > 0) {
        it.each(opened)('%s abre un diálogo del que se puede salir', async (_story, Story) => {
          const user = userEvent.setup();
          await renderWithProvider(<Story testID="dialogo" />);
          const isOpen = () => screen.queryByTestId('dialogo', HIDDEN) !== null;
          expect(isOpen()).toBe(true);

          // Tocar fuera cierra un diálogo descartable. El que exige respuesta trae un botón
          // con el que darla.
          await user.press(screen.getByTestId('dialogo-backdrop', HIDDEN));
          for (let next = 0; isOpen(); next += 1) {
            const button = screen.queryAllByRole('button')[next];
            if (button === undefined) break;
            await user.press(button);
          }

          expect(isOpen()).toBe(false);
        });
      }
    },
  );
});
