import { cardVariants } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Card } from './Card';

/**
 * Historias solo web (ADR-012): estados de una tarjeta pulsable que dependen de
 * pseudo-clases CSS y del teclado. Las fuerza `storybook-addon-pseudo-states`, así
 * quedan fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Superficies/Card/Estados web',
  component: Card,
  parameters: { maturity: 'experimental' },
  args: { onPress: fn(), children: <Text>Noche Satella</Text> },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const matrix: NonNullable<Story['render']> = (args) => (
  <Stack gap={4}>
    {cardVariants.map((variant) => (
      <Card key={variant} {...args} variant={variant}>
        <Text>{variant}</Text>
      </Card>
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

/** Se enfoca con Tab y se activa con Intro y con Espacio, como un botón. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const card = canvas.getByRole('button', { name: 'Noche Satella' });
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};
