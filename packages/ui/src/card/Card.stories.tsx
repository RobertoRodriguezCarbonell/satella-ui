import { cardVariants, spaceTokens } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Badge } from '../badge';
import { Box } from '../box';
import { Button } from '../button';
import { Divider } from '../divider';
import { Icon } from '../icon';
import { Stack } from '../stack';
import { Text } from '../text';
import { Card } from './Card';

/** El contenido de una tarjeta de evento, para no repetirlo en cada historia. */
function EventSummary() {
  return (
    <Stack gap={2}>
      <Stack direction="row" gap={2} align="center">
        <Badge variant="warning">Últimas entradas</Badge>
      </Stack>
      <Text variant="subheading">Noche Satella</Text>
      <Stack direction="row" gap={2} align="center">
        <Icon name="calendar" size="sm" color="muted" />
        <Text variant="bodySmall" color="secondary">
          Viernes 14 de noviembre, 21:00
        </Text>
      </Stack>
      <Stack direction="row" gap={2} align="center">
        <Icon name="map-pin" size="sm" color="muted" />
        <Text variant="bodySmall" color="secondary">
          Sala Apolo, Barcelona
        </Text>
      </Stack>
    </Stack>
  );
}

const meta = {
  title: 'Superficies/Card',
  component: Card,
  parameters: { maturity: 'experimental' },
  argTypes: {
    variant: { control: 'radio', options: cardVariants },
    padding: { control: 'select', options: spaceTokens },
    children: { control: false },
  },
  args: { variant: 'outlined', padding: 4, children: <EventSummary /> },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Agrupa contenido relacionado. No es interactiva: sus controles van dentro. */
export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <Stack gap={4}>
        <EventSummary />
        <Divider />
        <Stack direction="row" gap={3} align="center" justify="between">
          <Text variant="subheading">24 €</Text>
          <Button size="sm" iconStart="ticket">
            Comprar
          </Button>
        </Stack>
      </Stack>
    </Card>
  ),
};

/** `outlined` se apoya en el borde; `elevated` añade sombra para separarse del fondo. */
export const Variantes: Story = {
  render: (args) => (
    <Stack gap={5}>
      {cardVariants.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text variant="label" color="muted">
            {variant}
          </Text>
          <Card {...args} variant={variant} />
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * Con `onPress`, toda la tarjeta es un botón y su nombre accesible es su contenido.
 * Dentro no debe haber otros controles.
 */
export const Pulsable: Story = {
  args: { onPress: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Noche Satella/ }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** Con `padding={0}` el contenido llega hasta el borde y la tarjeta lo recorta a su radio. */
export const SinRelleno: Story = {
  args: { padding: 0 },
  render: (args) => (
    <Card {...args}>
      <Box background="muted" padding={10}>
        <Stack align="center">
          <Icon name="ticket" size="xl" color="muted" />
        </Stack>
      </Box>
      <Box padding={4}>
        <EventSummary />
      </Box>
    </Card>
  ),
};

/** `padding` acepta cualquier espacio de los tokens. */
export const Relleno: Story = {
  render: (args) => (
    <Stack gap={3}>
      {([2, 4, 6] as const).map((padding) => (
        <Card key={padding} {...args} padding={padding}>
          <Text variant="bodySmall">{`padding ${padding}`}</Text>
        </Card>
      ))}
    </Stack>
  ),
};

/** Las dos variantes, estáticas y pulsables. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5}>
      {cardVariants.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text variant="label" color="muted">
            {variant}
          </Text>
          <Card variant={variant}>
            <Text>Tarjeta estática</Text>
          </Card>
          <Card variant={variant} onPress={() => undefined}>
            <Text>Tarjeta pulsable</Text>
          </Card>
        </Stack>
      ))}
    </Stack>
  ),
};
