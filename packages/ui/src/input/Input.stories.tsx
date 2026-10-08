import { controlSizes, inputTypes } from '@satellatickets/core';
import { iconNames } from '@satellatickets/icons';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Input } from './Input';

const meta = {
  title: 'Formularios/Input',
  component: Input,
  parameters: { maturity: 'experimental' },
  argTypes: {
    type: { control: 'select', options: inputTypes },
    size: { control: 'radio', options: controlSizes },
    iconStart: { control: 'select', options: [undefined, ...iconNames] },
    iconEnd: { control: 'select', options: [undefined, ...iconNames] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    // Sin `FormField`, el campo necesita su propio nombre accesible.
    accessibilityLabel: 'Correo electrónico',
    placeholder: 'tu@correo.com',
    type: 'email',
    size: 'md',
    onChangeText: fn(),
    onSubmit: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Avisa con el texto completo en cada cambio. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Correo electrónico' });
    await userEvent.type(input, 'ana@satella.com');
    await expect(input).toHaveValue('ana@satella.com');
    await expect(args.onChangeText).toHaveBeenLastCalledWith('ana@satella.com');
  },
};

/** `type` elige el teclado y el autocompletado de cada plataforma. */
export const Tipos: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Input {...args} type="text" accessibilityLabel="Nombre" placeholder="Nombre y apellidos" />
      <Input {...args} type="email" accessibilityLabel="Correo" placeholder="tu@correo.com" />
      <Input {...args} type="password" accessibilityLabel="Contraseña" placeholder="Contraseña" />
      <Input {...args} type="search" accessibilityLabel="Buscar" placeholder="Buscar eventos" />
      <Input {...args} type="tel" accessibilityLabel="Teléfono" placeholder="600 000 000" />
      <Input {...args} type="url" accessibilityLabel="Web" placeholder="https://" />
      <Input {...args} type="number" accessibilityLabel="Entradas" placeholder="0" />
    </Stack>
  ),
};

/** Las mismas alturas que `Button`: un campo y un botón del mismo tamaño quedan alineados. */
export const Tamanos: Story = {
  render: (args) => (
    <Stack gap={3}>
      {controlSizes.map((size) => (
        <Input
          key={size}
          {...args}
          size={size}
          accessibilityLabel={`Correo (${size})`}
          placeholder={`Tamaño ${size}`}
        />
      ))}
    </Stack>
  ),
};

/** Los iconos son decorativos: no sustituyen a la etiqueta. */
export const ConIconos: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Input
        {...args}
        type="search"
        iconStart="search"
        accessibilityLabel="Buscar"
        placeholder="Buscar eventos"
      />
      <Input
        {...args}
        type="text"
        iconStart="map-pin"
        iconEnd="chevron-down"
        accessibilityLabel="Ciudad"
        placeholder="Ciudad"
      />
    </Stack>
  ),
};

/** Inválido: borde de error y `aria-invalid`. El mensaje lo pone `FormField`. */
export const Invalido: Story = {
  args: { invalid: true, defaultValue: 'ana@satella' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Correo electrónico' })).toBeInvalid();
  },
};

/** Deshabilitado no se puede enfocar ni editar. */
export const Deshabilitado: Story = {
  args: { disabled: true, defaultValue: 'ana@satella.com' },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Correo electrónico' });
    await expect(input).toBeDisabled();
    await userEvent.type(input, 'x');
    await expect(args.onChangeText).not.toHaveBeenCalled();
  },
};

/** Solo lectura: se puede enfocar y copiar, pero no editar. */
export const SoloLectura: Story = {
  args: { readOnly: true, defaultValue: 'ana@satella.com' },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Correo electrónico' });
    await userEvent.type(input, 'x');
    await expect(input).toHaveValue('ana@satella.com');
    await expect(args.onChangeText).not.toHaveBeenCalled();
  },
};

/**
 * Controlado: con `value`, manda la app. Aquí convierte a mayúsculas lo que se
 * escribe, como haría con un código promocional.
 */
export const Controlado: Story = {
  args: { type: 'text', accessibilityLabel: 'Código promocional', placeholder: 'CÓDIGO' },
  render: function Controlado(args) {
    const [value, setValue] = useState('');
    return (
      <Stack gap={2}>
        <Input
          {...args}
          value={value}
          onChangeText={(text) => {
            setValue(text.toUpperCase());
            args.onChangeText?.(text);
          }}
        />
        <Text variant="caption" color="muted">
          {`Valor: ${value === '' ? '(vacío)' : value}`}
        </Text>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Código promocional' });
    await userEvent.type(input, 'satella10');
    await expect(input).toHaveValue('SATELLA10');
    await expect(canvas.getByText('Valor: SATELLA10')).toBeInTheDocument();
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
          <Input {...args} size={size} accessibilityLabel={`Vacío (${size})`} />
          <Input
            {...args}
            size={size}
            iconStart="search"
            defaultValue="ana@satella.com"
            accessibilityLabel={`Con valor (${size})`}
          />
          <Input
            {...args}
            size={size}
            invalid
            defaultValue="ana@satella"
            accessibilityLabel={`Inválido (${size})`}
          />
          <Input
            {...args}
            size={size}
            readOnly
            defaultValue="ana@satella.com"
            accessibilityLabel={`Solo lectura (${size})`}
          />
          <Input
            {...args}
            size={size}
            disabled
            iconStart="search"
            defaultValue="ana@satella.com"
            accessibilityLabel={`Deshabilitado (${size})`}
          />
        </Stack>
      ))}
    </Stack>
  ),
};
