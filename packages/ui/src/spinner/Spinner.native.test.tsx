import { composeStories } from '@storybook/react';
import { screen } from '@testing-library/react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Spinner.stories';

const { Default, ConEtiqueta } = composeStories(stories);

describe('Spinner (nativo)', () => {
  it('con label se anuncia como progreso indeterminado', async () => {
    await renderWithProvider(<ConEtiqueta />);

    const spinner = screen.getByRole('progressbar', { name: 'Cargando eventos' });
    expect(spinner).toBeBusy();
  });

  it('sin label es decorativo: los lectores de pantalla lo ignoran', async () => {
    await renderWithProvider(<Default testID="spinner" />);

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByTestId('spinner')).toBeNull();
    expect(screen.getByTestId('spinner', { includeHiddenElements: true })).toBeTruthy();
  });

  it('mide lo mismo que el icono de su tamaño', async () => {
    await renderWithProvider(<Default size="lg" testID="spinner" />);

    expect(screen.getByTestId('spinner', { includeHiddenElements: true })).toHaveStyle({
      width: 24,
      height: 24,
    });
  });
});
