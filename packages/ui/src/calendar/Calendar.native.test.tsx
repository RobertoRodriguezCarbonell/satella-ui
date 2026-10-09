import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Calendar } from './Calendar';
import * as stories from './Calendar.stories';

// Las historias son la especificación compartida con web (ADR-017): se comprueban las
// mismas interacciones que sus funciones `play`.
const {
  Default,
  FechaInicial,
  Periodo,
  PeriodoElegido,
  Limites,
  DiasDeshabilitados,
  DiasSenalados,
  OtroIdioma,
  Compacto,
  Deshabilitado,
} = composeStories(stories);

// Los mismos espías que comprueban las funciones `play` en web: los `fn()` de `meta.args`.
const { onValueChange, onMonthChange } = stories.default.args;

type Styled = { props: { style?: unknown } } | null;

function styleOf(element: Styled) {
  return (StyleSheet.flatten(element?.props.style as never) ?? {}) as Record<string, unknown>;
}

const day = (name: string) => screen.getByRole('button', { name });
/** Los días elegidos o dentro del periodo, por su número. */
const selectedDays = () =>
  screen
    .getAllByRole('button', { selected: true })
    .map((button) => (button.props.accessibilityLabel as string).replace(/^\D+(\d+) de .*$/, '$1'));

describe('Calendar (nativo)', () => {
  beforeEach(() => {
    onValueChange.mockClear();
    onMonthChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('se abre por el mes de hoy, con un botón por día', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByText('Octubre de 2026')).toBeOnTheScreen();
      // Los 31 días y los dos botones de cambio de mes.
      expect(screen.getAllByRole('button')).toHaveLength(33);
      expect(screen.queryAllByRole('button', { selected: true })).toHaveLength(0);
    });

    it('pulsar un día lo elige y avisa con su fecha ISO', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(day('jueves, 15 de octubre de 2026'));

      expect(onValueChange).toHaveBeenLastCalledWith('2026-10-15');
      expect(day('jueves, 15 de octubre de 2026')).toBeSelected();
      expect(selectedDays()).toEqual(['15']);
    });

    it('los botones cambian de mes y avisan', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('button', { name: 'Mes siguiente' }));
      expect(screen.getByText('Noviembre de 2026')).toBeOnTheScreen();
      expect(onMonthChange).toHaveBeenLastCalledWith('2026-11');
      // Noviembre tiene 30 días.
      expect(screen.getAllByRole('button')).toHaveLength(32);

      await user.press(screen.getByRole('button', { name: 'Mes anterior' }));
      expect(screen.getByText('Octubre de 2026')).toBeOnTheScreen();
    });

    it('con una fecha elegida se abre por su mes', async () => {
      await renderWithProvider(<FechaInicial />);

      expect(screen.getByText('Diciembre de 2026')).toBeOnTheScreen();
      expect(day('jueves, 24 de diciembre de 2026')).toBeSelected();
    });

    it('en un periodo, la primera pulsación fija el inicio y la segunda el final', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Periodo />);

      await user.press(day('jueves, 15 de octubre de 2026'));
      expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-15', end: '' });
      expect(selectedDays()).toEqual(['15']);

      // La segunda fecha es anterior: el periodo queda ordenado.
      await user.press(day('lunes, 12 de octubre de 2026'));
      expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-12', end: '2026-10-15' });
      expect(selectedDays()).toEqual(['12', '13', '14', '15']);

      await user.press(day('martes, 20 de octubre de 2026'));
      expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-20', end: '' });
      expect(selectedDays()).toEqual(['20']);
    });

    it('un periodo controlado por la app', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<PeriodoElegido />);
      expect(screen.getByText('Del 2026-10-05 al 2026-10-18')).toBeOnTheScreen();
      expect(selectedDays()).toHaveLength(14);

      await user.press(day('jueves, 22 de octubre de 2026'));

      expect(screen.getByText('Desde 2026-10-22')).toBeOnTheScreen();
    });

    it('fuera de min y max no se elige ni se cambia de mes', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Limites />);
      const past = day('jueves, 8 de octubre de 2026');

      expect(past).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
      await user.press(past);
      expect(onValueChange).not.toHaveBeenCalled();

      await user.press(screen.getByRole('button', { name: 'Mes siguiente' }));
      expect(screen.getByRole('button', { name: 'Mes siguiente' })).toBeDisabled();
      expect(day('domingo, 8 de noviembre de 2026')).toBeEnabled();
      expect(day('lunes, 9 de noviembre de 2026')).toBeDisabled();
    });

    it('isDateDisabled deshabilita días sueltos', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<DiasDeshabilitados />);
      const monday = day('lunes, 12 de octubre de 2026');

      expect(monday).toBeDisabled();
      expect(day('martes, 13 de octubre de 2026')).toBeEnabled();
      await user.press(monday);

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('deshabilitado entero, no se elige nada ni se cambia de mes', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitado />);

      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
      await user.press(day('martes, 20 de octubre de 2026'));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('accesibilidad', () => {
    it('el calendario tiene nombre y no agrupa sus días en un solo elemento', async () => {
      await renderWithProvider(<Default testID="fecha" />);

      const root = screen.getByTestId('fecha');
      expect(root.props.accessibilityLabel).toBe('Fecha del evento');
      expect(root.props.accessible).not.toBe(true);
    });

    it('cada día dice su fecha completa, y los señalados lo que añade la app', async () => {
      await renderWithProvider(<DiasSenalados />);

      expect(day('sábado, 3 de octubre de 2026, con eventos')).toBeOnTheScreen();
      expect(day('domingo, 4 de octubre de 2026')).toBeOnTheScreen();
    });

    it('la cabecera muestra la inicial y dice el nombre entero del día', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByLabelText('miércoles')).toHaveTextContent('X');
      expect(
        ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(
          (name) => screen.getByLabelText(name).props.children as string,
        ),
      ).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    });

    it('los textos salen de Intl en el idioma de locale', async () => {
      await renderWithProvider(<OtroIdioma />);

      expect(screen.getByText('October 2026')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: /^Friday,? October 9, 2026$/ })).toBeOnTheScreen();
      expect(screen.getByLabelText('Sunday')).toBeOnTheScreen();
    });

    it('el cambio de mes se anuncia', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByText('Octubre de 2026').props.accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('aspecto', () => {
    it.each([
      ['md', Default, themes.dark.size.control.md],
      ['sm', Compacto, themes.dark.size.control.sm],
    ] as const)(
      'en %s cada día es un cuadrado del alto de un control',
      async (_size, Story, side) => {
        await renderWithProvider(<Story testID="fecha" />);

        expect(styleOf(day('viernes, 9 de octubre de 2026'))).toMatchObject({
          width: side,
          height: side,
        });
        // Siete columnas, ni más ni menos.
        expect(styleOf(screen.getByTestId('fecha')).width).toBe(side * 7);
      },
    );

    it('el día elegido se rellena con el color de la acción principal y hoy lleva contorno', async () => {
      await renderWithProvider(<Compacto />, { theme: 'dark' });

      expect(styleOf(day('jueves, 15 de octubre de 2026'))).toMatchObject({
        backgroundColor: themes.dark.color.action.primary,
        borderColor: 'transparent',
      });
      expect(styleOf(screen.getByText('15')).color).toBe(themes.dark.color.text.onPrimary);
      expect(styleOf(day('viernes, 9 de octubre de 2026'))).toMatchObject({
        backgroundColor: 'transparent',
        borderColor: themes.dark.color.border.strong,
      });
      expect(styleOf(day('sábado, 10 de octubre de 2026')).borderColor).toBe('transparent');
    });

    it('un periodo es una franja teñida, redondeada donde empieza y acaba', async () => {
      await renderWithProvider(<PeriodoElegido />, { theme: 'dark' });
      const cell = (name: string) => styleOf(day(name).parent);
      const radius = themes.dark.radius.md;

      expect(cell('lunes, 5 de octubre de 2026')).toMatchObject({
        backgroundColor: themes.dark.color.accent.bg,
        borderTopLeftRadius: radius,
        borderBottomLeftRadius: radius,
      });
      expect(cell('lunes, 5 de octubre de 2026').borderTopRightRadius).toBeUndefined();
      expect(cell('jueves, 8 de octubre de 2026')).toMatchObject({
        backgroundColor: themes.dark.color.accent.bg,
      });
      expect(cell('jueves, 8 de octubre de 2026').borderTopLeftRadius).toBeUndefined();
      expect(cell('domingo, 18 de octubre de 2026')).toMatchObject({
        borderTopRightRadius: radius,
        borderBottomRightRadius: radius,
      });
      expect(cell('lunes, 19 de octubre de 2026').backgroundColor).toBeUndefined();
      // Los dos extremos van rellenos; lo de en medio, no.
      expect(styleOf(day('lunes, 5 de octubre de 2026')).backgroundColor).toBe(
        themes.dark.color.action.primary,
      );
      expect(styleOf(day('jueves, 8 de octubre de 2026')).backgroundColor).toBe('transparent');
      // Hoy cae dentro del periodo: su contorno es del color del acento, que sí contrasta
      // con el fondo teñido en todas las marcas.
      expect(styleOf(day('viernes, 9 de octubre de 2026')).borderColor).toBe(
        themes.dark.color.accent.text,
      );
    });

    it('un día deshabilitado se atenúa', async () => {
      await renderWithProvider(<Limites />, { theme: 'dark' });

      expect(styleOf(screen.getByText('8')).color).toBe(themes.dark.color.text.disabled);
      expect(styleOf(screen.getByText('10')).color).toBe(themes.dark.color.text.primary);
    });

    it('la semana puede empezar en otro día', async () => {
      await renderWithProvider(
        <Calendar
          locale="es"
          today="2026-10-09"
          weekStartsOn={0}
          previousMonthLabel="Mes anterior"
          nextMonthLabel="Mes siguiente"
        />,
      );

      const initials = screen
        .getAllByLabelText(/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)$/)
        .map((header) => header.props.children as string);
      expect(initials).toEqual(['D', 'L', 'M', 'X', 'J', 'V', 'S']);
    });
  });
});
