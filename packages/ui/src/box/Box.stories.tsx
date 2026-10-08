import {
  backgroundTokens,
  borderColorTokens,
  radiusTokens,
  shadowTokens,
  spaceTokens,
} from '@satellatickets/core';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Box } from './Box';

const meta = {
  title: 'Fundamentos/Box',
  component: Box,
  parameters: { maturity: 'experimental' },
  argTypes: {
    padding: { control: 'select', options: spaceTokens },
    paddingX: { control: 'select', options: spaceTokens },
    paddingY: { control: 'select', options: spaceTokens },
    background: { control: 'select', options: backgroundTokens },
    radius: { control: 'select', options: radiusTokens },
    borderColor: { control: 'select', options: borderColorTokens },
    shadow: { control: 'select', options: shadowTokens },
  },
  args: {
    padding: 4,
    background: 'surface',
    radius: 'md',
    children: <Text>Un contenedor con relleno, fondo y radio tomados de los tokens.</Text>,
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConBorde: Story = {
  args: { borderColor: 'default' },
};

export const ConSombra: Story = {
  args: { shadow: 'md', background: 'elevated' },
};

export const Fondos: Story = {
  render: () => (
    <Stack gap={3}>
      {backgroundTokens.map((background) => (
        <Box key={background} background={background} padding={4} radius="md" borderColor="default">
          <Text variant="label" color={background === 'inverse' ? 'inverse' : 'muted'}>
            bg.{background}
          </Text>
        </Box>
      ))}
    </Stack>
  ),
};

export const Sombras: Story = {
  render: () => (
    <Stack direction="row" gap={6} wrap>
      {shadowTokens.map((shadow) => (
        <Box key={shadow} shadow={shadow} background="elevated" padding={5} radius="lg">
          <Text variant="label" color="muted">
            shadow.{shadow}
          </Text>
        </Box>
      ))}
    </Stack>
  ),
};

export const Radios: Story = {
  render: () => (
    <Stack direction="row" gap={4} wrap>
      {radiusTokens.map((radius) => (
        <Box key={radius} radius={radius} background="surface" borderColor="strong" padding={4}>
          <Text variant="label" color="muted">
            radius.{radius}
          </Text>
        </Box>
      ))}
    </Stack>
  ),
};
