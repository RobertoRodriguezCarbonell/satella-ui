import { expect, fn, within } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Calendar } from './Calendar';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del teclado y
 * del puntero. Las fuerza `storybook-addon-pseudo-states`, así quedan fijas en el catálogo
 * y en las referencias visuales.
 */
const meta = {
  title: 'Fechas/Calendar/Estados web',
  component: Calendar,
  parameters: { maturity: 'experimental' },
  args: {
    locale: 'es',
    // El 9 de octubre de 2026 es viernes.
    today: '2026-10-09',
    previousMonthLabel: 'Mes anterior',
    nextMonthLabel: 'Mes siguiente',
    accessibilityLabel: 'Fecha del evento',
    defaultValue: '2026-10-15',
    min: '2026-10-05',
    onValueChange: fn(),
    onMonthChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Un día deshabilitado no reacciona al puntero. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
};

/** El anillo de foco se dibuja fuera del día, por encima de sus vecinos. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
};

/**
 * Solo un día está en el orden de tabulación: el elegido o, si no hay, hoy. Así el
 * tabulador atraviesa el calendario en un par de paradas y no en treinta.
 */
export const UnSoloTabulador: Story = {
  play: async ({ canvas, userEvent }) => {
    const grid = canvas.getByRole('grid');
    const tabbable = within(grid)
      .getAllByRole('button')
      .filter((button) => button.getAttribute('tabindex') === '0');
    await expect(tabbable).toHaveLength(1);
    await expect(tabbable[0]).toHaveAccessibleName('jueves, 15 de octubre de 2026');

    // Con `min` en octubre no hay mes anterior al que ir: su botón está deshabilitado.
    await expect(canvas.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Mes siguiente' })).toHaveFocus();
    await userEvent.tab();
    await expect(tabbable[0]).toHaveFocus();
  },
};

/**
 * Las flechas mueven el foco un día o una semana; Inicio y Fin, a los extremos de la
 * semana; RePág y AvPág cambian de mes y, con Mayúsculas, de año. Intro y Espacio eligen.
 */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const day = (name: string) => canvas.getByRole('button', { name });
    day('jueves, 15 de octubre de 2026').focus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(day('viernes, 16 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(day('viernes, 23 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(day('lunes, 19 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(day('domingo, 25 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
    await expect(day('sábado, 17 de octubre de 2026')).toHaveFocus();

    // Moverse no elige: eso lo hacen Intro y Espacio.
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-17');
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('17');

    // Al salir del mes, el calendario cambia de mes y el foco sigue en el día.
    await userEvent.keyboard('{PageDown}');
    await expect(canvas.getByRole('grid', { name: 'Noviembre de 2026' })).toBeInTheDocument();
    await expect(day('martes, 17 de noviembre de 2026')).toHaveFocus();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith('2026-11');

    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await expect(day('miércoles, 17 de noviembre de 2027')).toHaveFocus();
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}{PageUp}');
    await expect(day('sábado, 17 de octubre de 2026')).toHaveFocus();

    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Un día que no se puede elegir sigue en el recorrido del teclado, para no dejar huecos,
 * pero Intro no lo elige. El foco no pasa de `min` ni de `max`.
 */
export const TecladoConLimites: Story = {
  args: { isDateDisabled: (date: string) => date === '2026-10-14' },
  play: async ({ args, canvas, userEvent }) => {
    const day = (name: string) => canvas.getByRole('button', { name });
    day('jueves, 15 de octubre de 2026').focus();

    await userEvent.keyboard('{ArrowLeft}');
    const disabled = day('miércoles, 14 de octubre de 2026');
    await expect(disabled).toHaveFocus();
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    // `min` es el 5 de octubre: ni una semana atrás ni un mes atrás pasan de ahí.
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(day('lunes, 5 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    await expect(day('lunes, 5 de octubre de 2026')).toHaveFocus();
    await expect(canvas.getByRole('grid', { name: 'Octubre de 2026' })).toBeInTheDocument();
  },
};

/**
 * En un periodo, tras elegir el inicio, se adelanta hasta el día sobre el que está el
 * puntero o el foco. Al salir de la rejilla, deja de pintarse.
 */
export const PeriodoAMedias: Story = {
  args: {
    mode: 'range',
    defaultValue: { start: '2026-10-12', end: '' },
    min: undefined,
    accessibilityLabel: 'Periodo del informe',
  },
  play: async ({ canvas, userEvent }) => {
    const grid = canvas.getByRole('grid');
    const selected = () => canvas.getAllByRole('gridcell', { selected: true });
    await expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    await expect(selected()).toHaveLength(1);

    await userEvent.hover(canvas.getByRole('button', { name: 'viernes, 16 de octubre de 2026' }));
    await expect(selected()).toHaveLength(5);
    // Hacia atrás también.
    await userEvent.hover(canvas.getByRole('button', { name: 'sábado, 10 de octubre de 2026' }));
    await expect(selected()).toHaveLength(3);

    // Con el teclado, el foco hace lo mismo que el puntero.
    canvas.getByRole('button', { name: 'lunes, 12 de octubre de 2026' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(selected()).toHaveLength(8);
  },
};

/**
 * Sigue el patrón de rejilla de fechas de ARIA: una rejilla con el nombre del mes, las
 * columnas con el nombre entero del día de la semana, y en cada día su fecha completa.
 */
export const Semantica: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Fecha del evento' })).toBeInTheDocument();
    const grid = canvas.getByRole('grid', { name: 'Octubre de 2026' });
    const headers = within(grid).getAllByRole('columnheader');
    await expect(headers.map((header) => header.getAttribute('abbr'))).toEqual([
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ]);
    await expect(headers.map((header) => header.textContent)).toEqual([
      'L',
      'M',
      'X',
      'J',
      'V',
      'S',
      'D',
    ]);
    // Seis semanas siempre: la altura no cambia de un mes a otro.
    await expect(within(grid).getAllByRole('row')).toHaveLength(7);
    // El 1 de octubre de 2026 es jueves: la cuarta columna de la primera semana.
    const firstWeek = within(grid).getAllByRole('row')[1];
    await expect(firstWeek?.children[3]).toHaveTextContent('1');
    await expect(firstWeek?.children[0]).toBeEmptyDOMElement();
  },
};
