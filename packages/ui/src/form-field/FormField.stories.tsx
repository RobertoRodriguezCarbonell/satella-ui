import { expect } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Input } from '../input';
import { Stack } from '../stack';
import { FormField } from './FormField';

const meta = {
  title: 'Formularios/FormField',
  component: FormField,
  parameters: { maturity: 'experimental' },
  argTypes: {
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: false },
  },
  args: {
    label: 'Correo electrónico',
    children: <Input type="email" placeholder="tu@correo.com" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** La etiqueta da nombre al control: pulsarla lo enfoca. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Correo electrónico' });
    await userEvent.click(canvas.getByText('Correo electrónico'));
    await expect(input).toHaveFocus();
  },
};

/** La ayuda queda enlazada al control: los lectores de pantalla la leen al enfocarlo. */
export const ConAyuda: Story = {
  args: { help: 'Te enviaremos las entradas a esta dirección.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Correo electrónico' }),
    ).toHaveAccessibleDescription('Te enviaremos las entradas a esta dirección.');
  },
};

/** Con `error`, el control se marca como inválido y el mensaje se añade a su descripción. */
export const ConError: Story = {
  args: {
    help: 'Te enviaremos las entradas a esta dirección.',
    error: 'Escribe un correo válido, como ana@correo.com.',
    children: <Input type="email" defaultValue="ana@satella" />,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Correo electrónico' });
    await expect(input).toBeInvalid();
    await expect(input).toHaveAccessibleDescription(
      'Te enviaremos las entradas a esta dirección. Escribe un correo válido, como ana@correo.com.',
    );
  },
};

/** Obligatorio: el asterisco es visual; al control le llega `aria-required`. */
export const Obligatorio: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Correo electrónico' })).toBeRequired();
  },
};

/** `disabled` en el campo deshabilita el control que contiene. */
export const Deshabilitado: Story = {
  args: {
    disabled: true,
    help: 'No se puede cambiar después de comprar.',
    children: <Input type="email" defaultValue="ana@satella.com" />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Correo electrónico' })).toBeDisabled();
  },
};

/** Los estados de un campo, uno debajo de otro como en un formulario. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5}>
      <FormField label="Nombre">
        <Input placeholder="Nombre y apellidos" />
      </FormField>
      <FormField label="Correo electrónico" required help="Te enviaremos las entradas aquí.">
        <Input type="email" placeholder="tu@correo.com" />
      </FormField>
      <FormField
        label="Teléfono"
        help="Solo para avisarte de cambios en el evento."
        error="Faltan cifras: escribe los 9 dígitos."
      >
        <Input type="tel" defaultValue="600 000" />
      </FormField>
      <FormField label="Código de socio" disabled help="Se rellena al iniciar sesión.">
        <Input defaultValue="SAT-0042" />
      </FormField>
    </Stack>
  ),
};
