import { textAligns, textColors, textVariants } from '@satellatickets/core';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Stack } from '../stack';
import { Text } from './Text';

const meta = {
  title: 'Fundamentos/Text',
  component: Text,
  parameters: { maturity: 'experimental' },
  argTypes: {
    variant: { control: 'select', options: textVariants },
    color: { control: 'select', options: textColors },
    align: { control: 'radio', options: textAligns },
    truncate: { control: 'boolean' },
  },
  args: {
    variant: 'body',
    color: 'primary',
    children: 'La noche empieza aquí: entradas para fiestas, clubs y conciertos.',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variantes: Story = {
  render: () => (
    <Stack gap={4}>
      {textVariants.map((variant) => (
        <Stack key={variant} gap={1}>
          <Text variant="label" color="muted">
            {variant}
          </Text>
          <Text variant={variant}>La noche empieza aquí</Text>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * Cada color sobre el fondo para el que está pensado. `onPrimary` y `onDanger` se
 * muestran sobre `action.primary` y `action.danger` en las historias de Button.
 */
export const Colores: Story = {
  render: () => (
    <Stack gap={2}>
      {(['primary', 'secondary', 'muted', 'link'] as const).map((color) => (
        <Box key={color} background="surface" padding={2} radius="sm">
          <Text color={color}>text.{color}</Text>
        </Box>
      ))}
      <Box background="inverse" padding={2} radius="sm">
        <Text color="inverse">text.inverse</Text>
      </Box>
    </Stack>
  ),
};

/** El texto de controles inactivos no exige contraste AA (WCAG 1.4.3). */
export const Deshabilitado: Story = {
  parameters: {
    a11y: {
      config: {
        // text.disabled no llega a 4.5:1 a propósito: WCAG 1.4.3 exime los controles inactivos.
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
  render: () => (
    <Box background="surface" padding={2} radius="sm">
      <Text color="disabled">text.disabled: opción no disponible</Text>
    </Box>
  ),
};

export const Alineaciones: Story = {
  render: () => (
    <Stack gap={2}>
      {textAligns.map((align) => (
        <Box key={align} background="surface" padding={2} radius="sm">
          <Text align={align}>align={align}</Text>
        </Box>
      ))}
    </Stack>
  ),
};

export const Truncado: Story = {
  render: () => (
    <Box background="surface" padding={3} radius="md">
      <Stack gap={2}>
        <Text truncate>
          Un texto muy largo que no cabe en una sola línea y se corta con puntos suspensivos en
          lugar de saltar de línea, como el nombre de un evento en una tarjeta estrecha.
        </Text>
        <Text>
          El mismo texto sin truncar: un texto muy largo que no cabe en una sola línea y se corta
          con puntos suspensivos en lugar de saltar de línea.
        </Text>
      </Stack>
    </Box>
  ),
};
