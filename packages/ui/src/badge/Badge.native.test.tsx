import { badgeVariants } from '@satellatickets/core';
import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { screen } from '@testing-library/react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Badge.stories';

// Las historias son la especificación compartida con web (ADR-017).
const { Default, AllVariants } = composeStories(stories);

describe('Badge (nativo)', () => {
  it('muestra su texto', async () => {
    await renderWithProvider(<Default />);

    expect(screen.getByText('Últimas entradas')).toBeOnTheScreen();
  });

  it('renderiza todas las variantes del contrato', async () => {
    await renderWithProvider(<AllVariants />);

    for (const variant of badgeVariants) {
      expect(screen.getByText(variant)).toBeOnTheScreen();
    }
  });

  // En nativo no hay regresión visual (ADR-017): esto comprueba que cada variante lee sus tokens.
  it.each(badgeVariants)(
    'la variante %s usa el fondo, el borde y el texto de su color de feedback',
    async (variant) => {
      await renderWithProvider(<Default variant={variant} testID="badge" />, { theme: 'dark' });
      const colors = themes.dark.color.feedback[variant];

      expect(screen.getByTestId('badge')).toHaveStyle({
        backgroundColor: colors.bg,
        borderColor: colors.border,
      });
      expect(screen.getByText('Últimas entradas')).toHaveStyle({ color: colors.text });
    },
  );
});
