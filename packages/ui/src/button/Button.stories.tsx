import { buttonVariants } from '@satellatickets/core';
import { iconNames } from '@satellatickets/icons';
import { brandNames } from '@satellatickets/tokens';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Stack } from '../stack';
import { Text } from '../text';
import { UIProvider } from '../ui-provider';
import { Button } from './Button';

const meta = {
  title: 'Acciones/Button',
  component: Button,
  parameters: { maturity: 'experimental' },
  argTypes: {
    variant: { control: 'select', options: buttonVariants.variant },
    size: { control: 'radio', options: buttonVariants.size },
    iconStart: { control: 'select', options: [undefined, ...iconNames] },
    iconEnd: { control: 'select', options: [undefined, ...iconNames] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Comprar entradas',
    onPress: fn(),
  },
  // El botón ocupa lo que mide su contenido, igual en web y en nativo.
  decorators: [
    (Story) => (
      <Stack align="start">
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Al pulsarlo dispara `onPress` una vez. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Comprar entradas' }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** La jerarquía de la acción: una sola `primary` por vista; `danger` para lo irreversible. */
export const Variantes: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center" wrap>
      {buttonVariants.variant.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </Stack>
  ),
};

export const Tamanos: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center" wrap>
      {buttonVariants.size.map((size) => (
        <Button key={size} {...args} size={size}>
          {`Tamaño ${size}`}
        </Button>
      ))}
    </Stack>
  ),
};

/** Los iconos toman el color del texto y el tamaño que corresponde al botón. */
export const ConIcono: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center" wrap>
      <Button {...args} iconStart="ticket">
        Comprar entradas
      </Button>
      <Button {...args} variant="secondary" iconEnd="arrow-right">
        Ver todos
      </Button>
      <Button {...args} variant="ghost" iconStart="calendar" iconEnd="chevron-down">
        Este fin de semana
      </Button>
    </Stack>
  ),
};

/** Deshabilitado no dispara `onPress` ni recibe el foco. */
export const Deshabilitado: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Comprar entradas' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/**
 * Cargando no dispara `onPress`, pero conserva el foco, el nombre accesible y la
 * anchura: el texto sigue ahí, oculto bajo el spinner.
 */
export const Cargando: Story = {
  args: { loading: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Comprar entradas' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** Ocupa todo el ancho de su contenedor, aunque este alinee su contenido al inicio. */
export const AnchoCompleto: Story = {
  args: { fullWidth: true, size: 'lg', iconStart: 'ticket' },
};

/** El color principal y el del texto sobre él cambian con la marca (ADR-029). */
export const Marcas: Story = {
  render: (args) => (
    <Stack gap={3}>
      {([undefined, ...brandNames] as const).map((brand) => (
        <UIProvider key={brand ?? 'satella'} theme="dark" brand={brand}>
          <Box background="canvas" padding={4} radius="md">
            <Stack gap={2}>
              <Text variant="label" color="muted">
                {brand ?? 'satella'}
              </Text>
              <Stack direction="row" gap={3} align="center" wrap>
                <Button {...args} iconStart="ticket">
                  Comprar entradas
                </Button>
                <Button {...args} variant="secondary">
                  Ver detalles
                </Button>
                <Button {...args} variant="ghost">
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </UIProvider>
      ))}
    </Stack>
  ),
};

/** Todas las variantes en todos los tamaños y estados. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={5}>
      {buttonVariants.variant.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text variant="label" color="muted">
            {variant}
          </Text>
          <Stack direction="row" gap={3} align="center" wrap>
            {buttonVariants.size.map((size) => (
              <Button key={size} {...args} variant={variant} size={size}>
                {`Tamaño ${size}`}
              </Button>
            ))}
            <Button {...args} variant={variant} iconStart="ticket">
              Con icono
            </Button>
            <Button {...args} variant={variant} disabled>
              Deshabilitado
            </Button>
            <Button {...args} variant={variant} loading>
              Cargando
            </Button>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
