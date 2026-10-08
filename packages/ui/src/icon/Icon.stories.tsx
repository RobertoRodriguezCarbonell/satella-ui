import { iconSizes, textColors } from '@satellatickets/core';
import { iconNames } from '@satellatickets/icons';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Stack } from '../stack';
import { Text } from '../text';
import { Icon } from './Icon';

const meta = {
  title: 'Fundamentos/Icon',
  component: Icon,
  parameters: { maturity: 'experimental' },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'radio', options: iconSizes },
    color: { control: 'select', options: textColors },
    label: { control: 'text' },
  },
  args: { name: 'ticket', size: 'md', color: 'primary' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConEtiqueta: Story = {
  args: { name: 'circle-check', color: 'link', label: 'Entrada validada' },
};

export const Todos: Story = {
  render: () => (
    <Stack direction="row" gap={4} wrap>
      {iconNames.map((name) => (
        <Box key={name} background="surface" radius="md" padding={3} borderColor="default">
          <Stack gap={2} align="center">
            <Icon name={name} size="lg" />
            <Text variant="caption" color="muted">
              {name}
            </Text>
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};

export const Tamanos: Story = {
  render: () => (
    <Stack direction="row" gap={4} align="center">
      {iconSizes.map((size) => (
        <Stack key={size} gap={1} align="center">
          <Icon name="calendar" size={size} />
          <Text variant="caption" color="muted">
            {size}
          </Text>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Colores: Story = {
  render: () => (
    <Stack direction="row" gap={4} wrap>
      {(['primary', 'secondary', 'muted', 'disabled', 'link', 'inverse'] as const).map((color) => (
        <Box
          key={color}
          background={color === 'inverse' ? 'inverse' : 'surface'}
          radius="md"
          padding={3}
        >
          <Stack gap={1} align="center">
            <Icon name="map-pin" color={color} />
            <Text variant="caption" color={color === 'inverse' ? 'inverse' : 'muted'}>
              {color}
            </Text>
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};
