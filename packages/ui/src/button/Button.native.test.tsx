import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Button } from './Button';
import * as stories from './Button.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, Deshabilitado, Cargando, AnchoCompleto } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onPress = stories.default.args.onPress;

const NAME = 'Comprar entradas';

function styleOf(element: { props: { style?: unknown } }) {
  return StyleSheet.flatten(element.props.style as never) as Record<string, unknown>;
}

describe('Button (nativo)', () => {
  beforeEach(() => {
    onPress.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('dispara onPress una vez al pulsar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('button', { name: NAME }));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('deshabilitado no dispara onPress', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);
      const button = screen.getByRole('button', { name: NAME });

      expect(button).toBeDisabled();
      await user.press(button);

      expect(onPress).not.toHaveBeenCalled();
    });

    it('cargando no dispara onPress', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Cargando />);

      await user.press(screen.getByRole('button', { name: NAME }));

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('accesibilidad', () => {
    it('cargando conserva su nombre y se anuncia como ocupado y deshabilitado', async () => {
      await renderWithProvider(<Cargando />);
      const button = screen.getByRole('button', { name: NAME });

      expect(button).toBeBusy();
      expect(button).toBeDisabled();
    });

    it('accessibilityLabel sustituye al texto como nombre accesible', async () => {
      await renderWithProvider(
        <Default accessibilityLabel="Comprar entradas para Noche Satella" />,
      );

      expect(
        screen.getByRole('button', { name: 'Comprar entradas para Noche Satella' }),
      ).toBeOnTheScreen();
    });

    it('un botón pequeño amplía su área táctil hasta la del control por defecto', async () => {
      await renderWithProvider(<Default size="sm" />);

      // 36 pt de alto + 4 pt por lado = 44 pt.
      expect(screen.getByRole('button', { name: NAME }).props.hitSlop).toBe(4);
    });

    it('muestra el anillo de foco al recibirlo y lo quita al perderlo', async () => {
      await renderWithProvider(<Default />);
      const button = screen.getByRole('button', { name: NAME });
      expect(styleOf(button).outlineWidth).toBeUndefined();

      await fireEvent(button, 'focus');
      expect(styleOf(screen.getByRole('button', { name: NAME }))).toMatchObject({
        outlineWidth: 2,
        outlineOffset: 2,
      });

      await fireEvent(screen.getByRole('button', { name: NAME }), 'blur');
      expect(styleOf(screen.getByRole('button', { name: NAME })).outlineWidth).toBeUndefined();
    });
  });

  describe('contenido', () => {
    it('envuelve en <Text> el texto y los números que recibe como children', async () => {
      await renderWithProvider(
        <Button>
          {'Comprar '}
          {2}
          {' entradas'}
        </Button>,
      );

      expect(screen.getByText('Comprar 2 entradas')).toBeOnTheScreen();
    });

    it('deja tal cual un children que no es texto', async () => {
      await renderWithProvider(
        <Button accessibilityLabel="Favorito">
          <Text testID="contenido-propio">★</Text>
        </Button>,
      );

      expect(screen.getByTestId('contenido-propio')).toBeOnTheScreen();
    });

    it('pinta los iconos y el spinner con el color del texto del botón', async () => {
      await renderWithProvider(<Default iconStart="ticket" iconEnd="arrow-right" testID="boton" />);
      const label = screen.getByText(NAME);
      const color = styleOf(label).color;

      const strokes = screen
        .getByTestId('boton')
        .queryAll((node) => typeof node.props.stroke === 'string')
        .map((node) => node.props.stroke as string);
      expect(strokes.length).toBeGreaterThan(0);
      expect(new Set(strokes)).toEqual(new Set([color]));
    });

    it('con fullWidth ocupa todo el ancho de su contenedor', async () => {
      await renderWithProvider(<AnchoCompleto />);

      expect(styleOf(screen.getByRole('button', { name: NAME })).width).toBe('100%');
    });
  });
});
