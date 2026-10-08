import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Checkbox } from './Checkbox';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del
 * teclado y de un `<form>`. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Formularios/Checkbox/Estados web',
  component: Checkbox,
  parameters: { maturity: 'experimental' },
  args: { children: 'Acepto las condiciones de compra', onCheckedChange: fn() },
  decorators: [
    (Story) => (
      <Stack align="start">
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAME = 'Acepto las condiciones de compra';

const pair: NonNullable<Story['render']> = (args) => (
  <Stack direction="row" gap={5} wrap>
    <Checkbox {...args}>Sin marcar</Checkbox>
    <Checkbox {...args} defaultChecked>
      Marcada
    </Checkbox>
  </Stack>
);

/** Al pasar el puntero, el borde de la casilla sin marcar toma el color de la acción. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  render: pair,
};

/** El anillo de foco se dibuja en la casilla y solo al navegar con teclado. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
  render: pair,
};

/** Se enfoca con Tab y se marca con Espacio, como cualquier casilla. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: NAME });
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
  },
};

/**
 * Sin `checked`, el navegador guarda el estado y la casilla viaja en el `<form>` con
 * su `name` y su `value`. El `<form>` es imprescindible aquí y esta historia nunca se
 * carga en nativo.
 */
export const EnFormulario: Story = {
  args: { name: 'condiciones', value: 'aceptadas' },
  render: (args) => (
    <form aria-label="Compra" onSubmit={(event) => event.preventDefault()}>
      <Checkbox {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole<HTMLFormElement>('form', { name: 'Compra' });
    await expect(new FormData(form).get('condiciones')).toBeNull();
    await userEvent.click(canvas.getByRole('checkbox', { name: NAME }));
    await expect(new FormData(form).get('condiciones')).toBe('aceptadas');
  },
};
