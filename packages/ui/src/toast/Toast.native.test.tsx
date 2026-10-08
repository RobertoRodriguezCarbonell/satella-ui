import { TOAST_MAX_VISIBLE } from '@satellatickets/core';
import { composeStories } from '@storybook/react';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Button } from '../button';
import { UIProvider } from '../ui-provider';
import * as stories from './Toast.stories';
import { useToast } from './index';

// Las historias son la especificación compartida con web (ADR-017): se comprueban las
// mismas interacciones que sus funciones `play`.
const { Default, Tonos, ConDescripcion, ConAccion, ConCierre, SeCierraSolo, Apilados } =
  composeStories(stories);

describe('Toast (nativo)', () => {
  let announce: jest.SpyInstance;

  beforeEach(() => {
    announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation();
  });

  afterEach(() => {
    announce.mockRestore();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('show muestra el toast en la zona de avisos del UIProvider', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      expect(screen.queryByRole('alert')).toBeNull();

      await user.press(screen.getByRole('button', { name: 'Guardar cambios' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Cambios guardados');
    });

    it('muestra la descripción', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConDescripcion />);

      await user.press(screen.getByRole('button', { name: 'Comprar' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        /Te hemos enviado las entradas a ana@correo\.com\./,
      );
    });

    it('la acción llama a su onPress y cierra el toast', async () => {
      const user = userEvent.setup();
      const onPress = jest.fn();
      await renderWithProvider(<ConAccion action={{ label: 'Deshacer', onPress }} />);

      await user.press(screen.getByRole('button', { name: 'Quitar del carrito' }));
      await user.press(screen.getByRole('button', { name: 'Deshacer' }));

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('con closeLabel muestra un botón de cierre que lo retira', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConCierre />);

      await user.press(screen.getByRole('button', { name: 'Reintentar el pago' }));
      expect(screen.getByRole('alert')).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: 'Cerrar aviso' }));

      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('pasada su duración, se cierra solo', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<SeCierraSolo />);

      await user.press(screen.getByRole('button', { name: 'Copiar enlace' }));
      expect(screen.getByRole('alert')).toBeOnTheScreen();

      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull(), { timeout: 3000 });
    });

    it('como mucho hay tres a la vez', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Apilados />);

      for (let count = 0; count < TOAST_MAX_VISIBLE + 1; count += 1) {
        await user.press(screen.getByRole('button', { name: 'Añadir entrada' }));
      }

      expect(screen.getAllByRole('alert')).toHaveLength(TOAST_MAX_VISIBLE);
    });
  });

  describe('accesibilidad', () => {
    it('anuncia cada toast una vez al llegar, con su título y su descripción', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConDescripcion />);

      await user.press(screen.getByRole('button', { name: 'Comprar' }));

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith(
        'Compra completada. Te hemos enviado las entradas a ana@correo.com.',
      );
    });

    it.each([
      ['danger', 'assertive'],
      ['info', 'polite'],
    ] as const)('un toast %s se anuncia en Android de forma %s', async (tone, live) => {
      const user = userEvent.setup();
      await renderWithProvider(<Tonos />);

      await user.press(screen.getByRole('button', { name: tone }));

      expect(screen.getByRole('alert').props.accessibilityLiveRegion).toBe(live);
    });

    it('los botones del toast quedan fuera del elemento que se anuncia', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConCierre />);
      await user.press(screen.getByRole('button', { name: 'Reintentar el pago' }));

      expect(
        screen.getByRole('alert').queryAll((node) => node.props.accessibilityRole === 'button'),
      ).toHaveLength(0);
    });
  });

  describe('UIProvider', () => {
    function Launcher() {
      const toast = useToast();
      return (
        <Button onPress={() => toast.show({ title: 'Guardado', duration: 0 })}>Guardar</Button>
      );
    }

    it('un UIProvider anidado usa la zona de avisos del de fuera', async () => {
      const user = userEvent.setup();
      await renderWithProvider(
        <UIProvider theme="dark" brand="organizer">
          <Launcher />
        </UIProvider>,
      );

      await user.press(screen.getByRole('button', { name: 'Guardar' }));

      expect(screen.getAllByRole('alert')).toHaveLength(1);
    });

    it('la zona de avisos no intercepta los toques de la app', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Launcher />);
      await user.press(screen.getByRole('button', { name: 'Guardar' }));

      const card = screen.getByRole('alert').parent as unknown as {
        parent: { props: Record<string, unknown> };
      };
      expect(card.parent.props.pointerEvents).toBe('box-none');
    });
  });
});
