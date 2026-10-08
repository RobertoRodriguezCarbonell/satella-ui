import { buttonVariants } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { IconButton } from './IconButton';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS y del
 * teclado. Las fuerza `storybook-addon-pseudo-states`, así quedan fijas en el
 * catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Acciones/IconButton/Estados web',
  component: IconButton,
  parameters: { maturity: 'experimental' },
  args: { icon: 'x', label: 'Cerrar', onPress: fn() },
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

const matrix: NonNullable<Story['render']> = (args) => (
  <Stack direction="row" gap={4} align="center" wrap>
    {buttonVariants.variant.map((variant) => (
      <IconButton key={variant} {...args} variant={variant} label={`Cerrar (${variant})`} />
    ))}
  </Stack>
);

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  render: matrix,
};

export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
  render: matrix,
};

/** El anillo de foco solo aparece al navegar con teclado (`:focus-visible`). */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
  render: matrix,
};

/** Se activa con Intro y con Espacio, como cualquier `<button>`. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Cerrar' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

/** Cargando sigue siendo enfocable, pero ni el teclado ni el ratón lo activan. */
export const CargandoConTeclado: Story = {
  args: { loading: true, variant: 'secondary' },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Cerrar' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
