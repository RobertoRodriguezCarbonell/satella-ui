import { badgeVariants } from '@satellatickets/core';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Badge } from './Badge';

const meta = {
  title: 'Feedback/Badge',
  component: Badge,
  parameters: { maturity: 'experimental' },
  argTypes: {
    variant: { control: 'select', options: badgeVariants },
  },
  args: { variant: 'info', children: 'Últimas entradas' },
  // La etiqueta ocupa lo que mide su contenido, igual en web y en nativo.
  decorators: [
    (Story) => (
      <Stack align="start">
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Todas las variantes: cada una usa el fondo, el borde y el texto de su color de feedback. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center" wrap>
      {badgeVariants.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          {variant}
        </Badge>
      ))}
    </Stack>
  ),
};
