import { calendarSizes } from '@satellatickets/core';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Calendar } from './Calendar';
import type { DateRange } from './Calendar.types';

// Un "hoy" fijo: las historias y sus referencias visuales no cambian con el día en que se
// ejecutan. El 9 de octubre de 2026 es viernes.
const TODAY = '2026-10-09';

const LABELS = {
  locale: 'es',
  today: TODAY,
  previousMonthLabel: 'Mes anterior',
  nextMonthLabel: 'Mes siguiente',
} as const;

/** Días con algún evento, para las historias que los señalan. */
const EVENT_DAYS = ['2026-10-03', '2026-10-09', '2026-10-17', '2026-10-18', '2026-10-31'];

const meta = {
  title: 'Fechas/Calendar',
  component: Calendar,
  parameters: { maturity: 'experimental' },
  argTypes: {
    size: { control: 'inline-radio', options: calendarSizes },
    locale: { control: 'text' },
    weekStartsOn: { control: { type: 'number', min: 0, max: 6 } },
    min: { control: 'text' },
    max: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    ...LABELS,
    size: 'md',
    accessibilityLabel: 'Fecha del evento',
    onValueChange: fn(),
    onMonthChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sin fecha elegida, se abre por el mes de hoy, que va marcado con un contorno. Las
 * fechas son textos ISO (`'2026-10-15'`), sin hora ni zona horaria.
 */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const grid = canvas.getByRole('grid', { name: 'Octubre de 2026' });
    // Octubre de 2026 tiene 31 días.
    await expect(within(grid).getAllByRole('button')).toHaveLength(31);
    const today = canvas.getByRole('button', { name: 'viernes, 9 de octubre de 2026' });
    await expect(today).toHaveAttribute('aria-current', 'date');

    await userEvent.click(canvas.getByRole('button', { name: 'jueves, 15 de octubre de 2026' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-15');
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('15');

    // Los botones cambian de mes y avisan, por si hay que pedir sus datos.
    await userEvent.click(canvas.getByRole('button', { name: 'Mes siguiente' }));
    await expect(canvas.getByRole('grid', { name: 'Noviembre de 2026' })).toBeInTheDocument();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith('2026-11');
    await userEvent.click(canvas.getByRole('button', { name: 'Mes anterior' }));
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('15');
  },
};

/** Con una fecha elegida, se abre por su mes. */
export const FechaInicial: Story = {
  args: { defaultValue: '2026-12-24' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('grid', { name: 'Diciembre de 2026' })).toBeInTheDocument();
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('24');
  },
};

/**
 * `mode="range"` elige un periodo: la primera pulsación fija el inicio y la segunda el
 * final, en el orden que sea. Una tercera empieza de nuevo.
 */
export const Periodo: Story = {
  args: { mode: 'range', accessibilityLabel: 'Periodo del informe' },
  play: async ({ args, canvas, userEvent }) => {
    const day = (number: number) =>
      within(canvas.getByRole('grid')).getByRole('button', { name: new RegExp(`, ${number} de `) });
    await userEvent.click(day(15));
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-15', end: '' });

    // La segunda fecha es anterior: el periodo queda ordenado.
    await userEvent.click(day(12));
    await expect(args.onValueChange).toHaveBeenLastCalledWith({
      start: '2026-10-12',
      end: '2026-10-15',
    });
    await expect(canvas.getAllByRole('gridcell', { selected: true })).toHaveLength(4);

    await userEvent.click(day(20));
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-20', end: '' });
    await expect(canvas.getAllByRole('gridcell', { selected: true })).toHaveLength(1);
  },
};

/** Un periodo ya elegido, controlado por la app. */
export const PeriodoElegido: Story = {
  args: { mode: 'range', accessibilityLabel: 'Periodo del informe' },
  render: function PeriodoElegido(args) {
    const [range, setRange] = useState<DateRange>({ start: '2026-10-05', end: '2026-10-18' });
    return (
      <Stack gap={3} align="start">
        <Calendar
          {...LABELS}
          mode="range"
          size={args.size}
          value={range}
          onValueChange={setRange}
        />
        <Text variant="bodySmall" color="secondary">
          {range.end === '' ? `Desde ${range.start}` : `Del ${range.start} al ${range.end}`}
        </Text>
      </Stack>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Del 2026-10-05 al 2026-10-18')).toBeInTheDocument();
    await expect(canvas.getAllByRole('gridcell', { selected: true })).toHaveLength(14);
  },
};

/**
 * `min` y `max` acotan lo que se puede elegir. Un día fuera de los límites no se elige, y
 * no se puede ir a un mes en el que no hay ninguno.
 */
export const Limites: Story = {
  args: { min: '2026-10-09', max: '2026-11-08' },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
    const past = canvas.getByRole('button', { name: 'jueves, 8 de octubre de 2026' });
    await expect(past).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(past);
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Mes siguiente' }));
    await expect(canvas.getByRole('button', { name: 'Mes siguiente' })).toBeDisabled();
  },
};

/** `isDateDisabled` deshabilita días sueltos: aquí, los lunes. */
export const DiasDeshabilitados: Story = {
  args: {
    // El 5 de octubre de 2026 es lunes.
    isDateDisabled: (date: string) => ['05', '12', '19', '26'].includes(date.slice(8)),
  },
  play: async ({ args, canvas, userEvent }) => {
    const monday = canvas.getByRole('button', { name: 'lunes, 12 de octubre de 2026' });
    await expect(monday).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(monday);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

/**
 * `isDateMarked` señala con un punto los días que tienen algo. `markedLabel` es lo que el
 * lector de pantalla añade al nombre de esos días.
 */
export const DiasSenalados: Story = {
  args: {
    isDateMarked: (date: string) => EVENT_DAYS.includes(date),
    markedLabel: 'con eventos',
    defaultValue: '2026-10-17',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'sábado, 3 de octubre de 2026, con eventos' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'domingo, 4 de octubre de 2026' }),
    ).toBeInTheDocument();
  },
};

/** Los textos los escribe `Intl` en el idioma de `locale`. La semana puede empezar en domingo. */
export const OtroIdioma: Story = {
  args: {
    locale: 'en-US',
    weekStartsOn: 0,
    previousMonthLabel: 'Previous month',
    nextMonthLabel: 'Next month',
    accessibilityLabel: 'Event date',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    const headers = canvas.getAllByRole('columnheader');
    await expect(headers[0]).toHaveAttribute('abbr', 'Sunday');
    await expect(headers[6]).toHaveAttribute('abbr', 'Saturday');
  },
};

/** `sm` para un calendario que se abre sobre un formulario en un escritorio. */
export const Compacto: Story = {
  args: { size: 'sm', defaultValue: '2026-10-15' },
};

/** Deshabilitado entero: no se elige nada ni se cambia de mes. */
export const Deshabilitado: Story = {
  args: { disabled: true, defaultValue: '2026-10-15' },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Mes siguiente' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'martes, 20 de octubre de 2026' }));
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

/** Los dos tamaños, con una fecha, con un periodo y con días señalados y deshabilitados. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6}>
      {calendarSizes.map((size) => (
        <Stack key={size} gap={2}>
          <Text variant="label" color="secondary">
            {size}
          </Text>
          <Stack direction="row" gap={6} wrap align="start">
            <Calendar
              {...LABELS}
              size={size}
              accessibilityLabel={`Una fecha, ${size}`}
              defaultValue="2026-10-15"
              isDateMarked={(date) => EVENT_DAYS.includes(date)}
            />
            <Calendar
              {...LABELS}
              mode="range"
              size={size}
              accessibilityLabel={`Un periodo, ${size}`}
              defaultValue={{ start: '2026-10-07', end: '2026-10-20' }}
            />
            <Calendar
              {...LABELS}
              size={size}
              accessibilityLabel={`Con límites, ${size}`}
              min="2026-10-09"
              max="2026-10-25"
              defaultValue="2026-10-21"
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
