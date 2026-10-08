import { spaceTokens, stackAligns, stackDirections, stackJustifies } from '@satellatickets/core';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Text } from '../text';
import { Stack } from './Stack';

function Item({ label, grow }: { label: string; grow?: boolean }) {
  return (
    <Box
      background="surface"
      borderColor="default"
      radius="md"
      padding={3}
      flex={grow ? 1 : undefined}
    >
      <Text variant="bodySmall">{label}</Text>
    </Box>
  );
}

const meta = {
  title: 'Fundamentos/Stack',
  component: Stack,
  parameters: { maturity: 'experimental' },
  argTypes: {
    direction: { control: 'radio', options: stackDirections },
    gap: { control: 'select', options: spaceTokens },
    align: { control: 'select', options: stackAligns },
    justify: { control: 'select', options: stackJustifies },
    wrap: { control: 'boolean' },
  },
  args: {
    direction: 'row',
    gap: 3,
    children: (
      <>
        <Item label="Uno" />
        <Item label="Dos" />
        <Item label="Tres" />
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fila: Story = {};
export const Columna: Story = { args: { direction: 'column' } };

export const Alineaciones: Story = {
  render: () => (
    <Stack gap={4}>
      {stackAligns.map((align) => (
        <Box key={align} background="subtle" padding={2} radius="md">
          <Text variant="label" color="muted">
            align={align}
          </Text>
          <Stack direction="row" gap={2} align={align}>
            <Item label="Corto" />
            <Box background="surface" borderColor="default" radius="md" padding={3}>
              <Text variant="bodySmall">Un elemento</Text>
              <Text variant="bodySmall">más alto</Text>
            </Box>
            <Item label="Corto" />
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};

export const Distribuciones: Story = {
  render: () => (
    <Stack gap={4}>
      {stackJustifies.map((justify) => (
        <Box key={justify} background="subtle" padding={2} radius="md">
          <Text variant="label" color="muted">
            justify={justify}
          </Text>
          <Stack direction="row" gap={2} justify={justify}>
            <Item label="A" />
            <Item label="B" />
            <Item label="C" />
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
};

export const ConSaltoDeLinea: Story = {
  args: {
    wrap: true,
    children: (
      <>
        {Array.from({ length: 12 }, (_, index) => (
          <Item key={index} label={`Elemento ${index + 1}`} />
        ))}
      </>
    ),
  },
};

export const Crecimiento: Story = {
  args: {
    children: (
      <>
        <Item label="Fijo" />
        <Item label="Crece (flex 1)" grow />
      </>
    ),
  },
};
