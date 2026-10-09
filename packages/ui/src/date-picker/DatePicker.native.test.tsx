import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './DatePicker.stories';

// Las historias son la especificación compartida con web (ADR-017). En nativo `DatePicker`
// es un disparador que abre un `Calendar` en una hoja inferior, la de `Sheet` (ADR-046).
const { Default, ConFecha, EnFormField, Limites, ConError, Deshabilitado } =
  composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onValueChange = stories.default.args.onValueChange;

const NAME = 'Fecha del evento';

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

const trigger = (name = NAME) => screen.getByRole('combobox', { name });
const day = (name: string) => screen.getByRole('button', { name });
/** El calendario ha dejado de estar en pantalla: la hoja tarda lo que dura su salida. */
const closed = () => waitFor(() => expect(screen.queryByText(/ de 2026$/)).toBeNull());

describe('DatePicker (nativo)', () => {
  beforeEach(() => {
    onValueChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('sin fecha muestra el placeholder', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByText('Elige una fecha')).toBeOnTheScreen();
      expect(trigger().props.accessibilityValue).toEqual({ text: 'Elige una fecha' });
      expect(trigger()).toBeCollapsed();
    });

    it('al pulsarlo abre el calendario por el mes de hoy; elegir un día avisa y cierra', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);
      expect(screen.queryByText('Octubre de 2026')).toBeNull();

      await user.press(trigger());
      expect(trigger()).toBeExpanded();
      expect(screen.getByText('Octubre de 2026')).toBeOnTheScreen();
      await user.press(day('jueves, 15 de octubre de 2026'));

      expect(onValueChange).toHaveBeenLastCalledWith('2026-10-15');
      expect(trigger()).toBeCollapsed();
      // La fecha se escribe abreviada; el lector de pantalla la dice entera.
      expect(screen.getByText(/^15 oct\.? 2026$/)).toBeOnTheScreen();
      expect(trigger().props.accessibilityValue).toEqual({ text: 'jueves, 15 de octubre de 2026' });
      await closed();
    });

    it('con una fecha elegida, el calendario se abre por su mes', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConFecha />);
      expect(screen.getByText(/^24 dic\.? 2026$/)).toBeOnTheScreen();

      await user.press(trigger());

      expect(screen.getByText('Diciembre de 2026')).toBeOnTheScreen();
      expect(day('jueves, 24 de diciembre de 2026')).toBeSelected();
    });

    it('pulsar la fecha que ya estaba elegida la confirma: cierra sin avisar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConFecha />);

      await user.press(trigger());
      await user.press(day('jueves, 24 de diciembre de 2026'));

      expect(onValueChange).not.toHaveBeenCalled();
      expect(trigger()).toBeCollapsed();
      await closed();
    });

    it('controlado dentro de un FormField: la app guarda la fecha', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<EnFormField />);
      expect(screen.getByText('Sin fecha')).toBeOnTheScreen();

      await user.press(trigger());
      await user.press(day('sábado, 31 de octubre de 2026'));

      expect(screen.getByText('Guardado: 2026-10-31')).toBeOnTheScreen();
    });

    it('un día fuera de los límites no se elige ni cierra el calendario', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Limites />);

      await user.press(trigger());
      expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
      expect(day('jueves, 8 de octubre de 2026')).toBeDisabled();
      await user.press(day('jueves, 8 de octubre de 2026'));

      expect(onValueChange).not.toHaveBeenCalled();
      expect(trigger()).toBeExpanded();
    });

    it('deshabilitado no se abre', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);

      expect(trigger()).toBeDisabled();
      await user.press(trigger());

      expect(screen.queryByText('Octubre de 2026')).toBeNull();
    });

    it('tocar fuera cierra el calendario sin cambiar la fecha', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConFecha testID="fecha" />);

      await user.press(trigger());
      await user.press(
        screen.getByTestId('fecha-calendar-backdrop', { includeHiddenElements: true }),
      );

      expect(onValueChange).not.toHaveBeenCalled();
      expect(trigger()).toBeCollapsed();
      await closed();
    });
  });

  describe('accesibilidad', () => {
    it('toma del FormField su nombre, y la ayuda como pista', async () => {
      await renderWithProvider(<EnFormField />);

      expect(trigger().props.accessibilityHint).toBe('El día en que se abren las puertas.');
      expect(trigger().props['aria-required']).toBe(true);
    });

    it('el error del FormField es su pista', async () => {
      await renderWithProvider(<ConError />);

      expect(trigger().props.accessibilityHint).toBe('La fecha ya ha pasado.');
    });

    it('la hoja lleva de título el nombre del campo', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(trigger());

      // El nombre del campo, una vez en el disparador y otra como título de la hoja.
      expect(screen.getAllByText(NAME, { includeHiddenElements: true }).length).toBeGreaterThan(0);
    });
  });

  describe('aspecto', () => {
    it('sin fecha, el texto es el del placeholder; con fecha, el del campo', async () => {
      await renderWithProvider(<Default />, { theme: 'dark' });
      expect(styleOf(screen.getByText('Elige una fecha')).color).toBe(themes.dark.color.text.muted);
    });

    it('con error, el borde es el de error', async () => {
      await renderWithProvider(<ConError />, { theme: 'dark' });

      expect(styleOf(trigger()).borderColor).toBe(themes.dark.color.feedback.danger.icon);
    });

    it('mide lo que un control de su tamaño', async () => {
      await renderWithProvider(<Default />);
      expect(styleOf(trigger()).minHeight).toBe(themes.dark.size.control.md);
    });

    it('en la hoja, los días tienen el tamaño táctil por defecto', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(trigger());

      expect(styleOf(day('viernes, 9 de octubre de 2026'))).toMatchObject({
        width: themes.dark.size.control.md,
        height: themes.dark.size.control.md,
      });
    });
  });
});
