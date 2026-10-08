import { themeModes } from '@satellatickets/core';
import { brandNames } from '@satellatickets/tokens';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Stack } from '../stack';
import { Text } from '../text';
import { UIProvider } from './UIProvider';

const meta = {
  title: 'Fundamentos/UIProvider',
  component: UIProvider,
  parameters: { maturity: 'experimental' },
  argTypes: {
    theme: { control: 'select', options: themeModes },
    brand: { control: 'select', options: [undefined, ...brandNames] },
  },
  // children lo aporta render; el contrato lo exige y StoryObj lo comprueba.
  args: { theme: 'dark', brand: undefined, children: null },
  render: (args) => (
    <UIProvider {...args}>
      <Box background="canvas" padding={6} radius="lg">
        <Stack gap={3}>
          <Text variant="title">Zona con su propio tema</Text>
          <Text color="secondary">
            Este bloque usa el tema y la marca de sus args, independientemente del selector de la
            toolbar.
          </Text>
          <Box background="surface" padding={4} radius="md" borderColor="default">
            <Text variant="label" color="muted">
              surface
            </Text>
            <Text>Texto principal sobre una superficie.</Text>
            <Text color="link">Un enlace</Text>
          </Box>
        </Stack>
      </Box>
    </UIProvider>
  ),
} satisfies Meta<typeof UIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Claro: Story = { args: { theme: 'light' } };
export const Oscuro: Story = { args: { theme: 'dark' } };
export const Admin: Story = { args: { theme: 'dark', brand: 'admin' } };
export const Organizer: Story = { args: { theme: 'dark', brand: 'organizer' } };

export const Anidado: Story = {
  render: () => (
    <UIProvider theme="light">
      <Box background="canvas" padding={6} radius="lg">
        <Stack gap={4}>
          <Text variant="heading">Zona clara</Text>
          <UIProvider theme="dark">
            <Box background="canvas" padding={4} radius="md">
              <Text variant="heading">Zona oscura anidada</Text>
              <Text color="secondary">Los proveedores pueden anidarse (ADR-010).</Text>
            </Box>
          </UIProvider>
        </Stack>
      </Box>
    </UIProvider>
  ),
};
