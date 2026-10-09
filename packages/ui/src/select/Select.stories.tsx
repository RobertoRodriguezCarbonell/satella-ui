import { controlSizes, type SelectOption } from '@satellatickets/core';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { FormField } from '../form-field';
import { Stack } from '../stack';
import { Text } from '../text';
import { Select } from './Select';

const CITIES: readonly SelectOption[] = [
  { value: 'mad', label: 'Madrid' },
  { value: 'bcn', label: 'Barcelona' },
  { value: 'vlc', label: 'Valencia' },
  { value: 'svq', label: 'Sevilla', disabled: true },
  { value: 'bio', label: 'Bilbao' },
];

const meta = {
  title: 'Formularios/Select',
  component: Select,
  parameters: { maturity: 'experimental' },
  argTypes: {
    size: { control: 'radio', options: controlSizes },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    options: { control: 'object' },
  },
  args: {
    options: CITIES,
    // Sin `FormField`, el campo necesita su propio nombre accesible.
    accessibilityLabel: 'Ciudad',
    placeholder: 'Elige una ciudad',
    size: 'md',
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sin opción elegida muestra el placeholder. Al pulsarlo abre la lista; al elegir avisa
 * con el `value` de la opción, no con su texto, y la cierra.
 */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await expect(select).toHaveTextContent('Elige una ciudad');
    await expect(canvas.queryByRole('listbox')).toBeNull();

    await userEvent.click(select);
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('option', { name: 'Barcelona' }));

    await expect(select).toHaveTextContent('Barcelona');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('bcn');
    await expect(canvas.queryByRole('listbox')).toBeNull();
  },
};

export const ConValor: Story = {
  args: { defaultValue: 'vlc' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Ciudad' })).toHaveTextContent('Valencia');
  },
};

/**
 * La lista abierta: la opción elegida lleva una marca y es la que aparece resaltada. En
 * web sale bajo el campo, con su ancho; en nativo ocupa el centro de la pantalla.
 */
export const Abierto: Story = {
  args: { defaultValue: 'vlc' },
  // La lista se pinta fuera de la caja de la historia: se captura el lienzo entero.
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Ciudad' }));
    await expect(canvas.getByRole('listbox', { name: 'Ciudad' })).toBeVisible();
    await expect(canvas.getByRole('option', { name: 'Valencia' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('option', { name: 'Madrid' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  },
};

/** Las mismas alturas que `Input` y `Button`. */
export const Tamanos: Story = {
  render: (args) => (
    <Stack gap={3}>
      {controlSizes.map((size) => (
        <Select
          key={size}
          {...args}
          size={size}
          accessibilityLabel={`Ciudad (${size})`}
          placeholder={`Tamaño ${size}`}
        />
      ))}
    </Stack>
  ),
};

/** Inválido: borde de error y `aria-invalid`. El mensaje lo pone `FormField`. */
export const Invalido: Story = {
  args: { invalid: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Ciudad' })).toBeInvalid();
  },
};

/** Deshabilitado no se puede abrir ni enfocar. */
export const Deshabilitado: Story = {
  args: { disabled: true, defaultValue: 'mad' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await expect(select).toBeDisabled();
    await expect(select).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Una opción deshabilitada se ve en la lista pero no se puede elegir: pulsarla no hace nada. */
export const OpcionDeshabilitada: Story = {
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Ciudad' }));
    const sevilla = canvas.getByRole('option', { name: 'Sevilla' });
    await expect(sevilla).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('option', { name: 'Bilbao' })).not.toHaveAttribute(
      'aria-disabled',
    );

    await userEvent.click(sevilla);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('listbox', { name: 'Ciudad' })).toBeVisible();
  },
};

/** Controlado: con `value`, manda la app. Aquí el texto de debajo refleja la elección. */
export const Controlado: Story = {
  render: function Controlado(args) {
    const [city, setCity] = useState('mad');
    return (
      <Stack gap={2}>
        <Select
          {...args}
          value={city}
          onValueChange={(next) => {
            setCity(next);
            args.onValueChange?.(next);
          }}
        />
        <Text variant="caption" color="muted">
          {`Valor: ${city}`}
        </Text>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await expect(canvas.getByText('Valor: mad')).toBeInTheDocument();
    await userEvent.click(select);
    await userEvent.click(canvas.getByRole('option', { name: 'Bilbao' }));
    await expect(canvas.getByText('Valor: bio')).toBeInTheDocument();
    await expect(select).toHaveTextContent('Bilbao');
  },
};

/** Dentro de un `FormField` toma su etiqueta, su ayuda y su error. */
export const EnFormField: Story = {
  args: { accessibilityLabel: undefined },
  render: (args) => (
    <FormField
      label="Ciudad"
      required
      help="Te enseñaremos primero los eventos de esa ciudad."
      error="Elige una ciudad para continuar."
    >
      <Select {...args} />
    </FormField>
  ),
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await expect(select).toBeInvalid();
    await expect(select).toBeRequired();
    await expect(select).toHaveAccessibleDescription(
      'Te enseñaremos primero los eventos de esa ciudad. Elige una ciudad para continuar.',
    );
  },
};

/** Todos los tamaños en todos los estados. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={5}>
      {controlSizes.map((size) => (
        <Stack key={size} gap={2}>
          <Text variant="label" color="muted">
            {size}
          </Text>
          <Select {...args} size={size} accessibilityLabel={`Sin elegir (${size})`} />
          <Select
            {...args}
            size={size}
            defaultValue="bcn"
            accessibilityLabel={`Con valor (${size})`}
          />
          <Select {...args} size={size} invalid accessibilityLabel={`Inválido (${size})`} />
          <Select
            {...args}
            size={size}
            disabled
            defaultValue="mad"
            accessibilityLabel={`Deshabilitado (${size})`}
          />
        </Stack>
      ))}
    </Stack>
  ),
};
