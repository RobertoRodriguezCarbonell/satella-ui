import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Checkbox.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, Marcada, Indeterminada, SinEtiqueta, Invalida, Deshabilitada, SeleccionarTodo } =
  composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onCheckedChange = stories.default.args.onCheckedChange;

const NAME = 'Acepto las condiciones de compra';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

/** La caja dibujada: el primer hijo del control. */
function boxOf(name: string) {
  const [box] = screen.getByRole('checkbox', { name }).children;
  return box as { props: { style?: unknown } };
}

describe('Checkbox (nativo)', () => {
  beforeEach(() => {
    onCheckedChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('se marca y se desmarca al pulsar, y avisa con el estado nuevo', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('checkbox', { name: NAME }));
      expect(screen.getByRole('checkbox', { name: NAME })).toBeChecked();
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);

      await user.press(screen.getByRole('checkbox', { name: NAME }));
      expect(screen.getByRole('checkbox', { name: NAME })).not.toBeChecked();
      expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    });

    it('defaultChecked la deja marcada de entrada', async () => {
      await renderWithProvider(<Marcada />);

      expect(screen.getByRole('checkbox', { name: NAME })).toBeChecked();
    });

    it('indeterminada se anuncia como parcialmente marcada', async () => {
      await renderWithProvider(<Indeterminada />);

      expect(screen.getByRole('checkbox', { name: 'Todas las zonas' })).toBePartiallyChecked();
    });

    it('deshabilitada no cambia ni avisa', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitada />);
      const checkbox = screen.getByRole('checkbox', { name: NAME });

      expect(checkbox).toBeDisabled();
      await user.press(checkbox);

      expect(screen.getByRole('checkbox', { name: NAME })).not.toBeChecked();
      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('controlada: la de arriba resume a las demás y las marca todas', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<SeleccionarTodo />);
      expect(screen.getByRole('checkbox', { name: 'Todas las zonas' })).toBePartiallyChecked();

      await user.press(screen.getByRole('checkbox', { name: 'Todas las zonas' }));
      expect(screen.getByRole('checkbox', { name: 'Todas las zonas' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Palco' })).toBeChecked();

      await user.press(screen.getByRole('checkbox', { name: 'Grada' }));
      expect(screen.getByRole('checkbox', { name: 'Todas las zonas' })).toBePartiallyChecked();
    });
  });

  describe('accesibilidad', () => {
    it('sin etiqueta visible usa accessibilityLabel como nombre', async () => {
      await renderWithProvider(<SinEtiqueta />);

      expect(screen.getByRole('checkbox', { name: 'Seleccionar entrada 1' })).toBeOnTheScreen();
    });

    it('amplía su área táctil hasta la del control por defecto', async () => {
      await renderWithProvider(<Default />);

      // 24 pt de alto + 10 pt por lado = 44 pt.
      expect(screen.getByRole('checkbox', { name: NAME }).props.hitSlop).toBe(10);
    });

    it('muestra el anillo de foco en la caja al recibirlo y lo quita al perderlo', async () => {
      await renderWithProvider(<Default />);
      expect(styleOf(boxOf(NAME)).outlineWidth).toBeUndefined();

      await fireEvent(screen.getByRole('checkbox', { name: NAME }), 'focus');
      expect(styleOf(boxOf(NAME))).toMatchObject({ outlineWidth: 2, outlineOffset: 2 });

      await fireEvent(screen.getByRole('checkbox', { name: NAME }), 'blur');
      expect(styleOf(boxOf(NAME)).outlineWidth).toBeUndefined();
    });
  });

  describe('aspecto', () => {
    it('marcada rellena la caja; sin marcar, no', async () => {
      await renderWithProvider(
        <>
          <Default />
          <Marcada>Marcada</Marcada>
        </>,
      );
      const empty = styleOf(boxOf(NAME));
      const filled = styleOf(boxOf('Marcada'));

      expect(filled.backgroundColor).not.toBe(empty.backgroundColor);
      expect(filled.borderColor).toBe(filled.backgroundColor);
    });

    it('inválida cambia el color del borde mientras no está marcada', async () => {
      await renderWithProvider(
        <>
          <Default />
          <Invalida>Inválida</Invalida>
        </>,
      );

      expect(styleOf(boxOf('Inválida')).borderColor).not.toBe(styleOf(boxOf(NAME)).borderColor);
    });

    it('la caja mide 20 pt y se alinea con la primera línea del texto', async () => {
      await renderWithProvider(<Default />);

      // Línea de 24 pt, caja de 20 pt: 2 pt de margen arriba.
      expect(styleOf(boxOf(NAME))).toMatchObject({ width: 20, height: 20, marginTop: 2 });
    });
  });
});
