import { controlSizes } from '@satellatickets/core';
import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { FormField } from '../form-field';
import { Stack } from '../stack';
import { Text } from '../text';
import { DatePicker } from './DatePicker';

// Un "hoy" fijo: las historias y sus referencias visuales no cambian con el día en que se
// ejecutan. El 9 de octubre de 2026 es viernes.
const LABELS = {
  locale: 'es',
  today: '2026-10-09',
  previousMonthLabel: 'Mes anterior',
  nextMonthLabel: 'Mes siguiente',
} as const;

const meta = {
  title: 'Fechas/DatePicker',
  component: DatePicker,
  parameters: { maturity: 'experimental' },
  argTypes: {
    size: { control: 'radio', options: controlSizes },
    placeholder: { control: 'text' },
    locale: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    ...LABELS,
    // Sin `FormField`, el campo necesita su propio nombre accesible.
    accessibilityLabel: 'Fecha del evento',
    placeholder: 'Elige una fecha',
    size: 'md',
    onValueChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sin fecha muestra el placeholder. Al pulsarlo abre el calendario por el mes de hoy; al
 * elegir un día avisa con la fecha como texto ISO, la escribe en el idioma de `locale` y
 * cierra.
 */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await expect(field).toHaveTextContent('Elige una fecha');
    await expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(field);
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    const calendar = canvas.getByRole('dialog', { name: 'Fecha del evento' });
    await expect(within(calendar).getByRole('grid', { name: 'Octubre de 2026' })).toBeVisible();
    await userEvent.click(
      within(calendar).getByRole('button', { name: 'jueves, 15 de octubre de 2026' }),
    );

    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-15');
    await expect(field).toHaveTextContent(/^15 oct\.? 2026$/);
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/** Con una fecha elegida, el calendario se abre por su mes. */
export const ConFecha: Story = {
  args: { defaultValue: '2026-12-24' },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await expect(field).toHaveTextContent(/^24 dic\.? 2026$/);
    await userEvent.click(field);
    await expect(canvas.getByRole('grid', { name: 'Diciembre de 2026' })).toBeVisible();
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('24');
  },
};

/**
 * Dentro de un `FormField` toma su etiqueta, su ayuda y su error, como los demás
 * controles. Aquí es controlado: la app guarda la fecha.
 */
export const EnFormField: Story = {
  args: { accessibilityLabel: undefined },
  render: function EnFormField(args) {
    const [date, setDate] = useState('');
    return (
      <Stack gap={3}>
        <FormField label="Fecha del evento" required help="El día en que se abren las puertas.">
          <DatePicker
            {...args}
            value={date}
            onValueChange={(next) => {
              setDate(next);
              args.onValueChange?.(next);
            }}
          />
        </FormField>
        <Text variant="bodySmall" color="secondary">
          {date === '' ? 'Sin fecha' : `Guardado: ${date}`}
        </Text>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: /Fecha del evento/ });
    await expect(field).toHaveAccessibleDescription('El día en que se abren las puertas.');
    await expect(field).toHaveAttribute('aria-required', 'true');
    await userEvent.click(field);
    await userEvent.click(canvas.getByRole('button', { name: 'sábado, 31 de octubre de 2026' }));
    await expect(canvas.getByText('Guardado: 2026-10-31')).toBeInTheDocument();
  },
};

/** `min` y `max` acotan lo que se puede elegir: aquí, de hoy a un mes vista. */
export const Limites: Story = {
  args: { min: '2026-10-09', max: '2026-11-08' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Fecha del evento' }));
    await expect(canvas.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'jueves, 8 de octubre de 2026' }));
    // Un día fuera de los límites no se elige ni cierra el calendario.
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

/** El error del `FormField` marca el campo como inválido. */
export const ConError: Story = {
  args: { accessibilityLabel: undefined, defaultValue: '2026-10-02' },
  render: (args) => (
    <FormField label="Fecha del evento" error="La fecha ya ha pasado.">
      <DatePicker {...args} />
    </FormField>
  ),
  play: async ({ canvas }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('La fecha ya ha pasado.');
  },
};

/** Deshabilitado no se abre ni se enfoca. */
export const Deshabilitado: Story = {
  args: { disabled: true, defaultValue: '2026-10-15' },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await expect(field).toBeDisabled();
    await userEvent.click(field);
    await expect(canvas.queryByRole('dialog')).toBeNull();
  },
};

/** Los tres tamaños de un control, y sus estados: sin fecha, con fecha, inválido y deshabilitado. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6}>
      {controlSizes.map((size) => (
        <Stack key={size} gap={2}>
          <Text variant="label" color="secondary">
            {size}
          </Text>
          <Stack direction="row" gap={3} wrap>
            <Stack flex={1}>
              <DatePicker
                {...LABELS}
                size={size}
                accessibilityLabel={`Sin fecha, ${size}`}
                placeholder="Elige una fecha"
              />
            </Stack>
            <Stack flex={1}>
              <DatePicker
                {...LABELS}
                size={size}
                accessibilityLabel={`Con fecha, ${size}`}
                defaultValue="2026-10-15"
              />
            </Stack>
            <Stack flex={1}>
              <DatePicker
                {...LABELS}
                size={size}
                accessibilityLabel={`Inválido, ${size}`}
                defaultValue="2026-10-02"
                invalid
              />
            </Stack>
            <Stack flex={1}>
              <DatePicker
                {...LABELS}
                size={size}
                accessibilityLabel={`Deshabilitado, ${size}`}
                defaultValue="2026-10-15"
                disabled
              />
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
