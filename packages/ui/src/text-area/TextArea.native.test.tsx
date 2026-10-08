import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './TextArea.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, Invalido, Deshabilitado, SoloLectura, EnFormField } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onChangeText = stories.default.args.onChangeText;

const NAME = 'Comentario';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

/** La caja del campo: el contenedor del `TextInput`, que lleva el borde y el fondo. */
function boxOf(input: { parent: unknown }) {
  return input.parent as { props: { style?: unknown } };
}

describe('TextArea (nativo)', () => {
  beforeEach(() => {
    onChangeText.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('avisa con el texto completo en cada cambio', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.type(screen.getByLabelText(NAME), 'No me ha llegado la entrada.');

      expect(screen.getByLabelText(NAME)).toHaveDisplayValue('No me ha llegado la entrada.');
      expect(onChangeText).toHaveBeenLastCalledWith('No me ha llegado la entrada.');
    });

    it('deshabilitado no se puede editar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);

      expect(screen.getByLabelText(NAME)).toBeDisabled();
      await user.type(screen.getByLabelText(NAME), 'x');

      expect(onChangeText).not.toHaveBeenCalled();
    });

    it('solo lectura conserva su valor', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<SoloLectura />);

      await user.type(screen.getByLabelText(NAME), 'x');

      expect(screen.getByLabelText(NAME)).toHaveDisplayValue('No me ha llegado la entrada.');
      expect(onChangeText).not.toHaveBeenCalled();
    });
  });

  describe('forma y estados', () => {
    it('es multilínea y rows fija su altura mínima', async () => {
      await renderWithProvider(<Default rows={4} />);
      const input = screen.getByLabelText(NAME);

      expect(input.props.multiline).toBe(true);
      // 4 líneas de 24 pt.
      expect(styleOf(input)).toMatchObject({ lineHeight: 24, minHeight: 96 });
    });

    it('al recibir el foco pinta el contorno y lo quita al perderlo', async () => {
      await renderWithProvider(<Default />);
      expect(styleOf(boxOf(screen.getByLabelText(NAME))).outlineWidth).toBeUndefined();

      await fireEvent(screen.getByLabelText(NAME), 'focus');
      expect(styleOf(boxOf(screen.getByLabelText(NAME))).outlineWidth).toBe(1);

      await fireEvent(screen.getByLabelText(NAME), 'blur');
      expect(styleOf(boxOf(screen.getByLabelText(NAME))).outlineWidth).toBeUndefined();
    });

    it('inválido cambia el color del borde', async () => {
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
  });

  describe('dentro de un FormField', () => {
    it('toma la etiqueta como nombre y el error y la ayuda como pista', async () => {
      await renderWithProvider(<EnFormField />);

      expect(screen.getByLabelText('Motivo de la devolución').props.accessibilityHint).toBe(
        'Escribe al menos una frase. Cuanto más detalle, antes podremos ayudarte.',
      );
    });
  });
});
