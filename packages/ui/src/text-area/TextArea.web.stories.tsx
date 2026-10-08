import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { TextArea } from './TextArea';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del
 * teclado y de un `<form>`. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Formularios/TextArea/Estados web',
  component: TextArea,
  parameters: { maturity: 'experimental' },
  args: {
    accessibilityLabel: 'Comentario',
    placeholder: 'Cuéntanos qué ha pasado',
    rows: 2,
    onChangeText: fn(),
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** El foco se dibuja en toda la caja; si el campo es inválido, con el color de error. */
export const Foco: Story = {
  parameters: { pseudo: { focusWithin: true } },
  render: (args) => (
    <Stack gap={4}>
      <TextArea {...args} />
      <TextArea {...args} invalid defaultValue="Hola" accessibilityLabel="Comentario inválido" />
    </Stack>
  ),
};

/** Se enfoca con Tab, e Intro añade una línea: no envía nada. */
export const Teclado: Story = {
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Comentario' });
    await userEvent.tab();
    await expect(textarea).toHaveFocus();
    await userEvent.keyboard('Hola{Enter}Soy Ana');
    await expect(textarea).toHaveValue('Hola\nSoy Ana');
  },
};

/**
 * Sin `value`, el navegador guarda el texto y el campo viaja en el `<form>` con su
 * `name`. El `<form>` es imprescindible aquí y esta historia nunca se carga en nativo.
 */
export const EnFormulario: Story = {
  args: { name: 'comentario' },
  render: (args) => (
    <form aria-label="Incidencia" onSubmit={(event) => event.preventDefault()}>
      <TextArea {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole('form', { name: 'Incidencia' });
    await userEvent.type(canvas.getByRole('textbox', { name: 'Comentario' }), 'Hola');
    await expect(new FormData(form as HTMLFormElement).get('comentario')).toBe('Hola');
  },
};
