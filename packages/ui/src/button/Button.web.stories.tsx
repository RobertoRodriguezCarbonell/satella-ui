import { buttonVariants } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Button } from './Button';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS y del
 * teclado. Las fuerza `storybook-addon-pseudo-states`, así quedan fijas en el
 * catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Acciones/Button/Estados web',
  component: Button,
  parameters: { maturity: 'experimental' },
  args: { children: 'Comprar entradas', onPress: fn() },
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

const matrix: NonNullable<Story['render']> = (args) => (
  <Stack direction="row" gap={4} align="center" wrap>
    {buttonVariants.variant.map((variant) => (
      <Button key={variant} {...args} variant={variant}>
        {variant}
      </Button>
    ))}
  </Stack>
);

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  render: matrix,
};

export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
  render: matrix,
};

/** El anillo de foco solo aparece al navegar con teclado (`:focus-visible`). */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
  render: matrix,
};

/** Se activa con Intro y con Espacio, como cualquier `<button>`. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Comprar entradas' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

/** Cargando sigue siendo enfocable, pero ni el teclado ni el ratón lo activan. */
export const CargandoConTeclado: Story = {
  args: { loading: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Comprar entradas' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/**
 * Con `type="submit"` envía el formulario; mientras carga, no. El `<form>` es
 * imprescindible aquí y esta historia nunca se carga en nativo.
 */
export const EnFormulario: Story = {
  args: { type: 'submit', children: 'Pagar' },
  render: (args) => (
    <form aria-label="Pago" onSubmit={(event) => event.preventDefault()}>
      <Stack direction="row" gap={3} align="center">
        <Button {...args} />
        <Button {...args} loading>
          Procesando
        </Button>
      </Stack>
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const onSubmit = fn();
    canvas.getByRole('form', { name: 'Pago' }).addEventListener('submit', onSubmit);
    await userEvent.click(canvas.getByRole('button', { name: 'Pagar' }));
    await expect(onSubmit).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole('button', { name: 'Procesando' }));
    await expect(onSubmit).toHaveBeenCalledOnce();
  },
};
