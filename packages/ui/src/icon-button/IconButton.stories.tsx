import { buttonVariants } from '@satellatickets/core';
import { iconNames } from '@satellatickets/icons';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { IconButton } from './IconButton';

const meta = {
  title: 'Acciones/IconButton',
  component: IconButton,
  parameters: { maturity: 'experimental' },
  argTypes: {
    icon: { control: 'select', options: iconNames },
    label: { control: 'text' },
    variant: { control: 'select', options: buttonVariants.variant },
    size: { control: 'radio', options: buttonVariants.size },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    icon: 'x',
    label: 'Cerrar',
    variant: 'ghost',
    size: 'md',
    onPress: fn(),
  },
  // El botón ocupa lo que mide, igual en web y en nativo.
  decorators: [
    (Story) => (
      <Stack align="start">
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Su nombre es `label`, no el icono. Al pulsarlo dispara `onPress` una vez. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar' }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** Las mismas variantes que `Button`. Por defecto es `ghost`: acompaña, no protagoniza. */
export const Variantes: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center" wrap>
      {buttonVariants.variant.map((variant) => (
        <IconButton key={variant} {...args} variant={variant} label={`Cerrar (${variant})`} />
      ))}
    </Stack>
  ),
};

/** Cuadrado, con el lado de la altura de un `Button` del mismo tamaño. */
export const Tamanos: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center" wrap>
      {buttonVariants.size.map((size) => (
        <IconButton
          key={size}
          {...args}
          variant="secondary"
          size={size}
          label={`Cerrar (${size})`}
        />
      ))}
    </Stack>
  ),
};

/** Deshabilitado no dispara `onPress` ni recibe el foco. */
export const Deshabilitado: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Cerrar' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Cargando sustituye el icono por un spinner y no dispara `onPress`, pero conserva el foco y el nombre. */
export const Cargando: Story = {
  args: { loading: true, variant: 'secondary' },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Cerrar' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Todas las variantes en todos los tamaños y estados. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={5}>
      {buttonVariants.variant.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text variant="label" color="muted">
            {variant}
          </Text>
          <Stack direction="row" gap={3} align="center" wrap>
            {buttonVariants.size.map((size) => (
              <IconButton
                key={size}
                {...args}
                variant={variant}
                size={size}
                label={`Cerrar (${variant}, ${size})`}
              />
            ))}
            <IconButton {...args} variant={variant} disabled label={`Deshabilitado (${variant})`} />
            <IconButton {...args} variant={variant} loading label={`Cargando (${variant})`} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
