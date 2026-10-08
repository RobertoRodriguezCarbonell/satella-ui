import { cardVariants } from '@satellatickets/core';
import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Text } from '../text';
import { Card } from './Card';
import * as stories from './Card.stories';

// Las historias son la especificación compartida con web (ADR-017).
const { Pulsable } = composeStories(stories);

// El nombre de una tarjeta pulsable es su contenido.
const NAME = /Noche Satella/;

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

describe('Card (nativo)', () => {
  it('muestra su contenido', async () => {
    await renderWithProvider(
      <Card>
        <Text>Contenido</Text>
      </Card>,
    );

    expect(screen.getByText('Contenido')).toBeOnTheScreen();
  });

  it('sin onPress no es un botón', async () => {
    await renderWithProvider(
      <Card>
        <Text>Contenido</Text>
      </Card>,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  // En nativo no hay regresión visual (ADR-017): esto comprueba que cada variante lee sus tokens.
  it.each(cardVariants)(
    'la variante %s usa su fondo, el borde por defecto y el radio de tarjeta',
    async (variant) => {
      await renderWithProvider(<Card variant={variant} testID="card" />, { theme: 'dark' });
      const theme = themes.dark;

      expect(screen.getByTestId('card')).toHaveStyle({
        backgroundColor: variant === 'outlined' ? theme.color.bg.surface : theme.color.bg.elevated,
        borderColor: theme.color.border.default,
        borderRadius: theme.radius.lg,
      });
    },
  );

  it('solo elevated lleva sombra', async () => {
    await renderWithProvider(
      <>
        <Card testID="plana" />
        <Card variant="elevated" testID="elevada" />
      </>,
    );

    expect(styleOf(screen.getByTestId('plana')).boxShadow).toBeUndefined();
    expect(styleOf(screen.getByTestId('elevada')).boxShadow).toBeDefined();
  });

  it('padding acepta un espacio de los tokens, también 0', async () => {
    await renderWithProvider(
      <>
        <Card testID="defecto" />
        <Card padding={0} testID="sin-relleno" />
      </>,
    );

    expect(screen.getByTestId('defecto')).toHaveStyle({ padding: 16 });
    expect(screen.getByTestId('sin-relleno')).toHaveStyle({ padding: 0, overflow: 'hidden' });
  });

  describe('pulsable', () => {
    it('con onPress toda la tarjeta es un botón y lo llama al pulsarla', async () => {
      const user = userEvent.setup();
      const onPress = jest.fn();
      await renderWithProvider(<Pulsable onPress={onPress} />);

      await user.press(screen.getByRole('button', { name: NAME }));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('muestra el anillo de foco al recibirlo y lo quita al perderlo', async () => {
      await renderWithProvider(<Pulsable />);
      expect(styleOf(screen.getByRole('button', { name: NAME })).outlineWidth).toBeUndefined();

      await fireEvent(screen.getByRole('button', { name: NAME }), 'focus');
      expect(styleOf(screen.getByRole('button', { name: NAME }))).toMatchObject({
        outlineWidth: 2,
        outlineOffset: 2,
      });

      await fireEvent(screen.getByRole('button', { name: NAME }), 'blur');
      expect(styleOf(screen.getByRole('button', { name: NAME })).outlineWidth).toBeUndefined();
    });
  });
});
