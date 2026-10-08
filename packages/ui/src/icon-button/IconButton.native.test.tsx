import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './IconButton.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, Deshabilitado, Cargando } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onPress = stories.default.args.onPress;

const NAME = 'Cerrar';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

/** Colores de trazo de los iconos (y del spinner, que es un icono) dentro del botón. */
function strokes() {
  return screen
    .getByRole('button', { name: NAME })
    .queryAll((node) => typeof node.props.stroke === 'string')
    .map((node) => node.props.stroke as string);
}

describe('IconButton (nativo)', () => {
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
    it('su nombre accesible es label', async () => {
      await renderWithProvider(<Default label="Cerrar el aviso" />);

      expect(screen.getByRole('button', { name: 'Cerrar el aviso' })).toBeOnTheScreen();
    });

    it('cargando conserva su nombre y se anuncia como ocupado y deshabilitado', async () => {
      await renderWithProvider(<Cargando />);
      const button = screen.getByRole('button', { name: NAME });

      expect(button).toBeBusy();
      expect(button).toBeDisabled();
    });

    it('un botón pequeño amplía su área táctil hasta la del control por defecto', async () => {
      await renderWithProvider(<Default size="sm" />);

      // 36 pt de lado + 4 pt por lado = 44 pt.
      expect(screen.getByRole('button', { name: NAME }).props.hitSlop).toBe(4);
    });

    it('muestra el anillo de foco al recibirlo y lo quita al perderlo', async () => {
      await renderWithProvider(<Default />);
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

  describe('forma y contenido', () => {
    it.each([
      ['sm', 36],
      ['md', 44],
      ['lg', 52],
    ] as const)('en tamaño %s es un cuadrado de %i pt', async (size, side) => {
      await renderWithProvider(<Default size={size} />);

      expect(styleOf(screen.getByRole('button', { name: NAME }))).toMatchObject({
        width: side,
        height: side,
      });
    });

    it('pinta el icono con el color del contenido de su variante', async () => {
      await renderWithProvider(<Default variant="primary" />);

      // `onPrimary` en el tema oscuro es blanco.
      expect(new Set(strokes())).toEqual(new Set(['#ffffff']));
    });

    it('deshabilitado pinta el icono con el color de texto deshabilitado', async () => {
      await renderWithProvider(
        <>
          <Default variant="primary" disabled />
          <Default variant="ghost" disabled label="Otro" />
        </>,
      );
      const disabledStrokes = strokes();
      const other = screen
        .getByRole('button', { name: 'Otro' })
        .queryAll((node) => typeof node.props.stroke === 'string')
        .map((node) => node.props.stroke as string);

      expect(disabledStrokes.length).toBeGreaterThan(0);
      expect(new Set(disabledStrokes)).toEqual(new Set(other));
    });

    it('cargando muestra el spinner en lugar del icono', async () => {
      await renderWithProvider(<Cargando icon="ticket" />);
      const button = screen.getByRole('button', { name: NAME });

      // El spinner es el icono `loader-circle` dentro de una vista que gira.
      const spinning = button.queryAll((node) => styleOf(node).transform !== undefined);
      expect(spinning).not.toHaveLength(0);
    });
  });
});
