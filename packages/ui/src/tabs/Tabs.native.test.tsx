import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text as RNText } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Tabs } from './Tabs';
import * as stories from './Tabs.stories';

// Las historias son la especificación compartida con web (ADR-017): se comprueban las
// mismas interacciones que sus funciones `play`.
const { Default, PestanaInicial, ConIconos, Deshabilitada, SinPaneles } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onValueChange = stories.default.args.onValueChange;

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

describe('Tabs (nativo)', () => {
  beforeEach(() => {
    onValueChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('empieza en la primera pestaña y muestra su panel', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByRole('tab', { name: 'Próximas' })).toBeSelected();
      expect(screen.getByRole('tab', { name: 'Pasadas' })).not.toBeSelected();
      expect(
        screen.getByText('Tienes 2 entradas para eventos que aún no han pasado.'),
      ).toBeOnTheScreen();
    });

    it('al elegir otra cambia el panel y avisa con su value', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('tab', { name: 'Pasadas' }));

      expect(screen.getByRole('tab', { name: 'Pasadas' })).toBeSelected();
      expect(screen.getByText('Has ido a 14 eventos con Satella.')).toBeOnTheScreen();
      expect(
        screen.queryByText('Tienes 2 entradas para eventos que aún no han pasado.'),
      ).toBeNull();
      expect(onValueChange).toHaveBeenLastCalledWith('pasadas');
    });

    it('defaultValue elige la pestaña inicial', async () => {
      await renderWithProvider(<PestanaInicial />);

      expect(screen.getByRole('tab', { name: 'Devueltas' })).toBeSelected();
    });

    it('una pestaña deshabilitada no se puede elegir', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitada />);
      const tab = screen.getByRole('tab', { name: 'Pago' });

      expect(tab).toBeDisabled();
      await user.press(tab);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: 'Entradas' })).toBeSelected();
    });

    it('sin content solo pinta las pestañas y la app decide qué mostrar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<SinPaneles />);
      expect(screen.getByText('Mostrando eventos de: hoy')).toBeOnTheScreen();

      await user.press(screen.getByRole('tab', { name: 'Este mes' }));

      expect(screen.getByText('Mostrando eventos de: mes')).toBeOnTheScreen();
    });

    it('si la primera está deshabilitada, empieza en la primera habilitada', async () => {
      await renderWithProvider(
        <Tabs
          items={[
            { value: 'a', label: 'Uno', disabled: true },
            { value: 'b', label: 'Dos' },
          ]}
        />,
      );

      expect(screen.getByRole('tab', { name: 'Dos' })).toBeSelected();
    });
  });

  describe('accesibilidad', () => {
    it('la lista se anuncia como grupo de pestañas con su nombre', async () => {
      await renderWithProvider(<Default />);

      // La lista no agrupa sus pestañas en un solo elemento: cada una se alcanza por separado.
      const list = screen.getByLabelText('Mis entradas');
      expect(list.props.accessibilityRole).toBe('tablist');
      expect(list.props.accessible).not.toBe(true);
    });

    it('los iconos son decorativos', async () => {
      await renderWithProvider(<ConIconos />);

      expect(screen.queryByRole('image')).toBeNull();
      expect(screen.getByRole('tab', { name: 'Fecha' })).toBeOnTheScreen();
    });
  });

  describe('aspecto', () => {
    it('la pestaña elegida lleva el indicador del color de la acción principal', async () => {
      await renderWithProvider(<Default />, { theme: 'dark' });

      expect(styleOf(screen.getByRole('tab', { name: 'Próximas' }))).toMatchObject({
        borderBottomWidth: 2,
        borderBottomColor: themes.dark.color.action.primary,
      });
      // El indicador ocupa siempre su sitio: al elegir una pestaña nada se mueve.
      expect(styleOf(screen.getByRole('tab', { name: 'Pasadas' }))).toMatchObject({
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
      });
    });

    it('cada pestaña mide al menos lo que un control por defecto', async () => {
      await renderWithProvider(<Default />);

      expect(styleOf(screen.getByRole('tab', { name: 'Próximas' })).minHeight).toBe(44);
    });

    it('envuelve en <Text> un panel de texto y deja tal cual otro contenido', async () => {
      await renderWithProvider(
        <Tabs
          items={[
            {
              value: 'a',
              label: 'Uno',
              content: <RNText testID="propio">Contenido propio</RNText>,
            },
          ]}
        />,
      );

      expect(screen.getByTestId('propio')).toBeOnTheScreen();
    });
  });
});
