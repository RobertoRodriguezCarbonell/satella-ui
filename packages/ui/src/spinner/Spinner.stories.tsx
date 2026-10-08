import { spinnerSizes } from '@satellatickets/core';
import { expect } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Stack } from '../stack';
import { Text } from '../text';
import { Spinner } from './Spinner';

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: { maturity: 'experimental' },
  argTypes: {
    size: { control: 'radio', options: spinnerSizes },
    color: { control: 'select', options: ['primary', 'secondary', 'muted', 'link'] },
    label: { control: 'text' },
  },
  args: { size: 'md', color: 'primary' },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sin `label` es decorativo: los lectores de pantalla lo ignoran. */
export const Default: Story = {};

/** Con `label` se anuncia como una barra de progreso indeterminada. */
export const ConEtiqueta: Story = {
  args: { label: 'Cargando eventos' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Cargando eventos' })).toBeInTheDocument();
  },
};

/** La misma escala que `Icon`: puede ocupar el sitio de un icono sin mover el contenido. */
export const Tamanos: Story = {
  render: () => (
    <Stack direction="row" gap={4} align="center">
      {spinnerSizes.map((size) => (
        <Stack key={size} gap={1} align="center">
          <Spinner size={size} />
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
      {(['primary', 'secondary', 'muted', 'link', 'inverse'] as const).map((color) => (
        <Box
          key={color}
          background={color === 'inverse' ? 'inverse' : 'surface'}
          radius="md"
          padding={3}
        >
          <Stack gap={1} align="center">
            <Spinner color={color} />
            <Text variant="caption" color={color === 'inverse' ? 'inverse' : 'muted'}>
              {color}
            </Text>
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};
