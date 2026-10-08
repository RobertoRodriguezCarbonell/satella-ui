import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Select.stories';

// Las historias son la especificación compartida con web (ADR-017). En nativo `Select`
// es un disparador que abre una lista modal (ADR-038): las opciones son botones de
// radio dentro de esa lista.
const { Default, ConValor, Invalido, Deshabilitado, Controlado, EnFormField } =
  composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onValueChange = stories.default.args.onValueChange;

const NAME = 'Ciudad';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

function trigger(name = NAME) {
  return screen.getByRole('combobox', { name });
}

describe('Select (nativo)', () => {
  beforeEach(() => {
    onValueChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('sin opción elegida muestra el placeholder', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByText('Elige una ciudad')).toBeOnTheScreen();
      expect(trigger().props.accessibilityValue).toEqual({ text: 'Elige una ciudad' });
    });

    it('al pulsarlo abre la lista, y al elegir avisa con el value y la cierra', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      expect(screen.queryByRole('radio', { name: 'Barcelona' })).toBeNull();

      await user.press(trigger());
      expect(trigger()).toBeExpanded();
      await user.press(screen.getByRole('radio', { name: 'Barcelona' }));

      expect(onValueChange).toHaveBeenLastCalledWith('bcn');
      expect(screen.queryByRole('radio', { name: 'Barcelona' })).toBeNull();
      expect(trigger().props.accessibilityValue).toEqual({ text: 'Barcelona' });
      expect(trigger()).toBeCollapsed();
    });

    it('defaultValue muestra esa opción y la marca en la lista', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConValor />);
      expect(screen.getByText('Valencia')).toBeOnTheScreen();

      await user.press(trigger());

      expect(screen.getByRole('radio', { name: 'Valencia' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Madrid' })).not.toBeChecked();
    });

    it('deshabilitado no se abre', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);

      expect(trigger()).toBeDisabled();
      await user.press(trigger());

      expect(screen.queryByRole('radio', { name: 'Madrid' })).toBeNull();
    });

    it('una opción deshabilitada no se puede elegir', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      await user.press(trigger());

      const option = screen.getByRole('radio', { name: 'Sevilla' });
      expect(option).toBeDisabled();
      await user.press(option);

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('radio', { name: 'Sevilla' })).toBeOnTheScreen();
    });

    it('controlado: muestra la opción que decide la app', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Controlado />);
      expect(screen.getByText('Valor: mad')).toBeOnTheScreen();

      await user.press(trigger());
      await user.press(screen.getByRole('radio', { name: 'Bilbao' }));

      expect(screen.getByText('Valor: bio')).toBeOnTheScreen();
      expect(trigger().props.accessibilityValue).toEqual({ text: 'Bilbao' });
    });

    it('elegir la opción que ya estaba no avisa, pero cierra la lista', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConValor />);

      await user.press(trigger());
      await user.press(screen.getByRole('radio', { name: 'Valencia' }));

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('radio', { name: 'Valencia' })).toBeNull();
    });
  });

  describe('cerrar sin elegir', () => {
    it('tocar fuera de la lista la cierra', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default testID="ciudad" />);
      await user.press(trigger());

      await user.press(screen.getByTestId('ciudad-backdrop', { includeHiddenElements: true }));

      expect(screen.queryByRole('radio', { name: 'Madrid' })).toBeNull();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('el botón atrás de Android la cierra', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default testID="ciudad" />);
      await user.press(trigger());

      await fireEvent(
        screen.getByTestId('ciudad-modal', { includeHiddenElements: true }),
        'requestClose',
      );

      expect(screen.queryByRole('radio', { name: 'Madrid' })).toBeNull();
    });
  });

  describe('estados y forma', () => {
    it('inválido cambia el color del borde', async () => {
      await renderWithProvider(
        <>
          <Default />
          <Invalido accessibilityLabel="Inválido" />
        </>,
      );

      expect(styleOf(trigger('Inválido')).borderColor).not.toBe(styleOf(trigger()).borderColor);
    });

    it('mientras la lista está abierta, el disparador se pinta como enfocado', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      expect(styleOf(trigger()).outlineWidth).toBeUndefined();

      await user.press(trigger());

      expect(styleOf(trigger()).outlineWidth).toBe(1);
    });

    it.each([
      ['sm', 36],
      ['md', 44],
      ['lg', 52],
    ] as const)('en tamaño %s mide al menos %i pt de alto', async (size, height) => {
      await renderWithProvider(<Default size={size} />);

      expect(styleOf(trigger()).minHeight).toBe(height);
    });
  });

  describe('dentro de un FormField', () => {
    it('toma la etiqueta como nombre, la pista del campo y la usa de título de la lista', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<EnFormField />);

      expect(trigger().props.accessibilityHint).toBe(
        'Elige una ciudad para continuar. Te enseñaremos primero los eventos de esa ciudad.',
      );
      await user.press(trigger());

      expect(screen.getByRole('header', { name: NAME })).toBeOnTheScreen();
    });
  });
});
