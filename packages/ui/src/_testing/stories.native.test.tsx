/**
 * Test de humo nativo: todas las historias compartidas se renderizan con las vistas
 * `.native.tsx` sin lanzar errores. Es el equivalente al que el addon de Vitest hace
 * en web con cada historia (ADR-016), y detecta, por ejemplo, texto fuera de `<Text>`.
 */
import fs from 'node:fs';
import path from 'node:path';

import { composeStories } from '@storybook/react';
import { screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';

import { renderWithProvider } from './render';

const SRC = path.resolve(__dirname, '..');

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
      const composed = composeStories(csf) as Record<string, ComponentType>;

      it.each(Object.entries(composed))('%s se renderiza', async (_story, Story) => {
        await renderWithProvider(<Story />);

        expect(screen.toJSON()).not.toBeNull();
      });
    },
  );
});
