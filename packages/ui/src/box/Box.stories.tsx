import {
  backgroundTokens,
  borderColorTokens,
  radiusTokens,
  shadowTokens,
  spaceTokens,
} from '@satellatickets/core';
import { expect } from 'storybook/test';

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

/**
 * Cada fondo como muestra, con su nombre fuera: `bg.overlay` es un velo translúcido
 * y no está pensado para llevar texto encima.
 */
export const Fondos: Story = {
  render: () => (
    <Stack gap={3}>
      {backgroundTokens.map((background) => (
        <Stack key={background} gap={1}>
          <Text variant="label" color="muted">
            bg.{background}
          </Text>
          <Box background={background} padding={5} radius="md" borderColor="default" />
        </Stack>
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

/** Un Box anidado no hereda el relleno, el fondo ni el borde del que lo contiene. */
export const Anidado: Story = {
  render: () => (
    <Box background="surface" padding={5} radius="lg" borderColor="strong" shadow="md">
      <Box testID="interior">
        <Text>El Box interior no tiene props: ni relleno, ni borde, ni sombra.</Text>
      </Box>
    </Box>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('interior')).toHaveStyle({
      paddingTop: '0px',
      borderTopWidth: '0px',
      borderRadius: '0px',
      boxShadow: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0)',
    });
  },
};
