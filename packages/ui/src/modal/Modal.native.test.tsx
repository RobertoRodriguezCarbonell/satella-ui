import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text as RNText } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Modal } from './Modal';
import * as stories from './Modal.stories';

// Las historias son la especificación compartida con web (ADR-017): se comprueban las
// mismas interacciones que sus funciones `play`. En nativo el diálogo es el `Modal` de
// React Native (ADR-040).
const { Default, Abierto, NoDescartable, SoloContenido } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onClose = stories.default.args.onClose;

const TITLE = 'Devolver las entradas';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

describe('Modal (nativo)', () => {
  beforeEach(() => {
    onClose.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('cerrado no pinta nada y se abre cuando la app pone open a true', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      expect(screen.queryByRole('header', { name: TITLE })).toBeNull();

      await user.press(screen.getByRole('button', { name: 'Devolver entradas' }));

      expect(screen.getByRole('header', { name: TITLE })).toBeOnTheScreen();
      expect(
        screen.getByText('Te devolveremos 48 € a la tarjeta con la que pagaste.'),
      ).toBeOnTheScreen();
    });

    it('el botón de cierre pide cerrar con onClose', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Abierto />);

      await user.press(screen.getByRole('button', { name: 'Cerrar' }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('header', { name: TITLE })).toBeNull();
    });

    it('las acciones del pie son contenido de la app', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Abierto />);

      await user.press(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByRole('header', { name: TITLE })).toBeNull();
    });
  });

  describe('cerrar sin responder', () => {
    it('tocar fuera pide cerrar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Abierto testID="devolucion" />);

      await user.press(screen.getByTestId('devolucion-backdrop', { includeHiddenElements: true }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('el botón atrás de Android pide cerrar', async () => {
      await renderWithProvider(<Abierto testID="devolucion" />);

      await fireEvent(
        screen.getByTestId('devolucion-modal', { includeHiddenElements: true }),
        'requestClose',
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('con dismissible={false}, ni tocar fuera ni el botón atrás lo cierran', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<NoDescartable testID="aviso" />);

      await user.press(screen.getByTestId('aviso-backdrop', { includeHiddenElements: true }));
      await fireEvent(
        screen.getByTestId('aviso-modal', { includeHiddenElements: true }),
        'requestClose',
      );

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('header', { name: '¿Sigues ahí?' })).toBeOnTheScreen();
    });

    it('sin closeLabel no hay botón de cierre', async () => {
      await renderWithProvider(<NoDescartable />);

      expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull();
    });
  });

  describe('contenido y accesibilidad', () => {
    it('el título es un encabezado y los lectores de pantalla no salen del diálogo', async () => {
      await renderWithProvider(<Abierto testID="devolucion" />);

      expect(screen.getByRole('header', { name: TITLE })).toBeOnTheScreen();
      expect(screen.getByTestId('devolucion').props.accessibilityViewIsModal).toBe(true);
    });

    it('envuelve en <Text> un contenido de texto y deja tal cual otro contenido', async () => {
      await renderWithProvider(
        <>
          <SoloContenido />
          <Modal open title="Otro" onClose={() => undefined}>
            <RNText testID="propio">Contenido propio</RNText>
          </Modal>
        </>,
      );

      expect(
        screen.getByText('Las entradas no se pueden revender por encima de su precio.'),
      ).toBeOnTheScreen();
      expect(screen.getByTestId('propio')).toBeOnTheScreen();
    });

    it('la superficie usa el fondo elevado y el radio de los modales', async () => {
      await renderWithProvider(<Abierto testID="devolucion" />, { theme: 'dark' });

      expect(styleOf(screen.getByTestId('devolucion'))).toMatchObject({
        backgroundColor: themes.dark.color.bg.elevated,
        borderRadius: themes.dark.radius.xl,
      });
    });
  });
});
