import { dividerOrientations } from '@satellatickets/core';
import { expect } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Divider } from './Divider';

const meta = {
  title: 'Superficies/Divider',
  component: Divider,
  parameters: { maturity: 'experimental' },
  argTypes: {
    orientation: { control: 'radio', options: dividerOrientations },
  },
  args: { orientation: 'horizontal' },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Separa dos bloques apilados y ocupa todo el ancho. */
export const Default: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Text>Entradas</Text>
      <Divider {...args} />
      <Text>Gastos de gestión</Text>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeInTheDocument();
  },
};

/** En vertical separa elementos de una fila y ocupa su altura. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Stack direction="row" gap={3} align="center">
      <Text>Viernes 14</Text>
      <Divider {...args} />
      <Text>21:00</Text>
      <Divider {...args} />
      <Text>Sala Apolo</Text>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const [separator] = canvas.getAllByRole('separator');
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  },
};

/** Las dos orientaciones. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={4}>
      <Text variant="label" color="muted">
        horizontal
      </Text>
      <Divider />
      <Text variant="label" color="muted">
        vertical
      </Text>
      <Stack direction="row" gap={4} align="center">
        <Text>Pista</Text>
        <Divider orientation="vertical" />
        <Text>Grada</Text>
        <Divider orientation="vertical" />
        <Text>Palco</Text>
      </Stack>
    </Stack>
  ),
};
