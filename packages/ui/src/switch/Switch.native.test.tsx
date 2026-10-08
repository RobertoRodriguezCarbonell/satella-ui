import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Switch.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, Activado, SinEtiqueta, Deshabilitado, Controlado } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onCheckedChange = stories.default.args.onCheckedChange;

const NAME = 'Avisarme de las preventas';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

/** El carril dibujado: el primer hijo del control. */
function trackOf(name: string) {
  const [track] = screen.getByRole('switch', { name }).children;
  return track as { props: { style?: unknown } };
}

describe('Switch (nativo)', () => {
  beforeEach(() => {
    onCheckedChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('se activa y se desactiva al pulsar, y avisa con el estado nuevo', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('switch', { name: NAME }));
      expect(screen.getByRole('switch', { name: NAME })).toBeChecked();
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);

      await user.press(screen.getByRole('switch', { name: NAME }));
      expect(screen.getByRole('switch', { name: NAME })).not.toBeChecked();
      expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    });

    it('defaultChecked lo deja activado de entrada', async () => {
      await renderWithProvider(<Activado />);

      expect(screen.getByRole('switch', { name: NAME })).toBeChecked();
    });

    it('deshabilitado no cambia ni avisa', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);
      const control = screen.getByRole('switch', { name: NAME });

      expect(control).toBeDisabled();
      await user.press(control);

      expect(screen.getByRole('switch', { name: NAME })).not.toBeChecked();
      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('controlado: refleja el estado que decide la app', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Controlado />);
      expect(screen.getByText('No recibirás avisos.')).toBeOnTheScreen();

      await user.press(screen.getByRole('switch', { name: NAME }));

      expect(screen.getByText('Te avisaremos por correo.')).toBeOnTheScreen();
      expect(screen.getByRole('switch', { name: NAME })).toBeChecked();
    });
  });

  describe('accesibilidad', () => {
    it('sin etiqueta visible usa accessibilityLabel como nombre', async () => {
      await renderWithProvider(<SinEtiqueta />);

      expect(screen.getByRole('switch', { name: 'Modo oscuro' })).toBeOnTheScreen();
    });

    it('amplía su área táctil hasta la del control por defecto', async () => {
      await renderWithProvider(<Default />);

      // 24 pt de alto + 10 pt por lado = 44 pt.
      expect(screen.getByRole('switch', { name: NAME }).props.hitSlop).toBe(10);
    });

    it('muestra el anillo de foco en el carril al recibirlo y lo quita al perderlo', async () => {
      await renderWithProvider(<Default />);
      expect(styleOf(trackOf(NAME)).outlineWidth).toBeUndefined();

      await fireEvent(screen.getByRole('switch', { name: NAME }), 'focus');
      expect(styleOf(trackOf(NAME))).toMatchObject({ outlineWidth: 2, outlineOffset: 2 });

      await fireEvent(screen.getByRole('switch', { name: NAME }), 'blur');
      expect(styleOf(trackOf(NAME)).outlineWidth).toBeUndefined();
    });
  });

  describe('aspecto', () => {
    it('encendido pinta el carril con el color de la acción principal', async () => {
      await renderWithProvider(
        <>
          <Default />
          <Activado>Encendido</Activado>
        </>,
      );

      expect(styleOf(trackOf('Encendido')).backgroundColor).not.toBe(
        styleOf(trackOf(NAME)).backgroundColor,
      );
    });

    it('el carril mide 40 × 24 pt y el pulgar 20 pt', async () => {
      await renderWithProvider(<Default />);
      const track = trackOf(NAME);
      const [thumb] = (track as unknown as { children: { props: { style?: unknown } }[] }).children;

      expect(styleOf(track)).toMatchObject({ width: 40, height: 24 });
      expect(styleOf(thumb as { props: { style?: unknown } })).toMatchObject({
        width: 20,
        height: 20,
      });
    });
  });
});
