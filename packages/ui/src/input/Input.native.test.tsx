import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Input } from './Input';
import * as stories from './Input.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, Invalido, Deshabilitado, SoloLectura, Controlado } = composeStories(stories);

// Los mismos espías que comprueban las funciones `play` en web: los `fn()` de `meta.args`.
const onChangeText = stories.default.args.onChangeText;
const onSubmit = stories.default.args.onSubmit;

const NAME = 'Correo electrónico';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

/** La caja del campo: el contenedor del `TextInput`, que lleva el borde y el fondo. */
function boxOf(input: { parent: unknown }) {
  return input.parent as { props: { style?: unknown } };
}

describe('Input (nativo)', () => {
  beforeEach(() => {
    onChangeText.mockClear();
    onSubmit.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('avisa con el texto completo en cada cambio', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      const input = screen.getByLabelText(NAME);

      await user.type(input, 'ana@satella.com');

      expect(screen.getByLabelText(NAME)).toHaveDisplayValue('ana@satella.com');
      expect(onChangeText).toHaveBeenLastCalledWith('ana@satella.com');
    });

    it('deshabilitado no se puede editar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);
      const input = screen.getByLabelText(NAME);

      expect(input).toBeDisabled();
      await user.type(input, 'x');

      expect(onChangeText).not.toHaveBeenCalled();
    });

    it('solo lectura conserva su valor', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<SoloLectura />);

      await user.type(screen.getByLabelText(NAME), 'x');

      expect(screen.getByLabelText(NAME)).toHaveDisplayValue('ana@satella.com');
      expect(onChangeText).not.toHaveBeenCalled();
    });

    it('controlado: muestra el valor que decide la app', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Controlado />);

      await user.type(screen.getByLabelText('Código promocional'), 'satella10');

      expect(screen.getByLabelText('Código promocional')).toHaveDisplayValue('SATELLA10');
      expect(screen.getByText('Valor: SATELLA10')).toBeOnTheScreen();
    });

    it('la tecla de envío del teclado llama a onSubmit', async () => {
      await renderWithProvider(<Default />);

      await fireEvent(screen.getByLabelText(NAME), 'submitEditing');

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('tipos', () => {
    it.each([
      ['email', { keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email' }],
      ['password', { secureTextEntry: true, autoCapitalize: 'none' }],
      ['search', { returnKeyType: 'search' }],
      ['tel', { keyboardType: 'phone-pad' }],
      ['url', { keyboardType: 'url', autoCapitalize: 'none' }],
      ['number', { keyboardType: 'decimal-pad' }],
    ] as const)('%s configura el teclado y el autocompletado', async (type, expected) => {
      await renderWithProvider(<Input type={type} accessibilityLabel="Campo" />);

      expect(screen.getByLabelText('Campo').props).toMatchObject(expected);
    });

    it('text no cambia nada del teclado', async () => {
      await renderWithProvider(<Input accessibilityLabel="Campo" />);
      const props = screen.getByLabelText('Campo').props as Record<string, unknown>;

      expect(props.keyboardType).toBeUndefined();
      expect(props.secureTextEntry).toBeUndefined();
    });
  });

  describe('estados', () => {
    it('al recibir el foco pinta el contorno con el color de foco y lo quita al perderlo', async () => {
      await renderWithProvider(<Default />);
      const rest = styleOf(boxOf(screen.getByLabelText(NAME)));
      expect(rest.outlineWidth).toBeUndefined();

      await fireEvent(screen.getByLabelText(NAME), 'focus');
      const focused = styleOf(boxOf(screen.getByLabelText(NAME)));
      expect(focused.outlineWidth).toBe(1);
      expect(focused.borderColor).toBe(focused.outlineColor);
      expect(focused.borderColor).not.toBe(rest.borderColor);

      await fireEvent(screen.getByLabelText(NAME), 'blur');
      expect(styleOf(boxOf(screen.getByLabelText(NAME))).outlineWidth).toBeUndefined();
    });

    it('inválido cambia el color del borde también sin foco', async () => {
      await renderWithProvider(
        <>
          <Default />
          <Invalido accessibilityLabel="Inválido" />
        </>,
      );

      expect(styleOf(boxOf(screen.getByLabelText('Inválido'))).borderColor).not.toBe(
        styleOf(boxOf(screen.getByLabelText(NAME))).borderColor,
      );
    });

    it('onFocus y onBlur de la app se siguen llamando', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      await renderWithProvider(<Default onFocus={onFocus} onBlur={onBlur} />);

      await fireEvent(screen.getByLabelText(NAME), 'focus');
      await fireEvent(screen.getByLabelText(NAME), 'blur');

      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('forma', () => {
    it.each([
      ['sm', 36],
      ['md', 44],
      ['lg', 52],
    ] as const)('en tamaño %s la caja mide al menos %i pt de alto', async (size, height) => {
      await renderWithProvider(<Default size={size} />);

      expect(styleOf(boxOf(screen.getByLabelText(NAME))).minHeight).toBe(height);
    });

    it('pinta los iconos como decorativos, fuera del árbol de accesibilidad', async () => {
      await renderWithProvider(<Default iconStart="search" />);

      expect(screen.queryByRole('image')).toBeNull();
    });
  });
});
