import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Input } from './Input';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del
 * teclado y de un `<form>`. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Formularios/Input/Estados web',
  component: Input,
  parameters: { maturity: 'experimental' },
  args: {
    accessibilityLabel: 'Correo electrónico',
    placeholder: 'tu@correo.com',
    type: 'email',
    onChangeText: fn(),
    onSubmit: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** El foco se dibuja en toda la caja; si el campo es inválido, con el color de error. */
export const Foco: Story = {
  parameters: { pseudo: { focusWithin: true } },
  render: (args) => (
    <Stack gap={4}>
      <Input {...args} />
      <Input {...args} invalid defaultValue="ana@satella" accessibilityLabel="Correo inválido" />
    </Stack>
  ),
};

/** Se enfoca con Tab; Intro llama a `onSubmit` sin borrar lo escrito. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Correo electrónico' });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard('ana@satella.com{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledOnce();
    await expect(input).toHaveValue('ana@satella.com');
  },
};

/** Pulsar el icono o el borde enfoca el campo: toda la caja se comporta como el `<input>`. */
export const ClicEnLaCaja: Story = {
  args: {
    iconStart: 'search',
    type: 'search',
    accessibilityLabel: 'Buscar',
    placeholder: 'Buscar',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const icon = canvasElement.querySelector('svg');
    await expect(icon).not.toBeNull();
    await userEvent.click(icon as SVGElement);
    await expect(canvas.getByRole('searchbox', { name: 'Buscar' })).toHaveFocus();
  },
};

/**
 * Sin `value`, el navegador guarda el texto y el campo viaja en el `<form>` con su
 * `name`. El `<form>` es imprescindible aquí y esta historia nunca se carga en nativo.
 */
export const EnFormulario: Story = {
  args: { name: 'correo' },
  render: (args) => (
    <form aria-label="Aviso" onSubmit={(event) => event.preventDefault()}>
      <Input {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole('form', { name: 'Aviso' });
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Correo electrónico' }),
      'ana@satella.com',
    );
    await expect(new FormData(form as HTMLFormElement).get('correo')).toBe('ana@satella.com');
  },
};
