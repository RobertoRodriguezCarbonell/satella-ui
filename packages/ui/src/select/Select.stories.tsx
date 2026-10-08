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
 * Sin opción elegida muestra el placeholder. Al elegir avisa con el `value` de la
 * opción, no con su texto.
 */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await expect(select).toHaveValue('');
    await userEvent.selectOptions(select, 'Barcelona');
    await expect(select).toHaveValue('bcn');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('bcn');
  },
};

export const ConValor: Story = {
  args: { defaultValue: 'vlc' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Ciudad' })).toHaveValue('vlc');
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
    await expect(canvas.getByRole('combobox', { name: 'Ciudad' })).toBeDisabled();
  },
};

/** Una opción deshabilitada se ve en la lista pero no se puede elegir. */
export const OpcionDeshabilitada: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('option', { name: 'Sevilla' })).toBeDisabled();
    await expect(canvas.getByRole('option', { name: 'Bilbao' })).toBeEnabled();
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
    await expect(canvas.getByText('Valor: mad')).toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Ciudad' }), 'Bilbao');
    await expect(canvas.getByText('Valor: bio')).toBeInTheDocument();
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
