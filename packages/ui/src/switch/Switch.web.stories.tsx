import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Switch } from './Switch';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del
 * teclado y de un `<form>`. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Formularios/Switch/Estados web',
  component: Switch,
  parameters: { maturity: 'experimental' },
  args: { children: 'Avisarme de las preventas', onCheckedChange: fn() },
  decorators: [
    (Story) => (
      <Stack align="start">
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAME = 'Avisarme de las preventas';

/** El anillo de foco se dibuja en el carril y solo al navegar con teclado. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
  render: (args) => (
    <Stack direction="row" gap={5} wrap>
      <Switch {...args}>Apagado</Switch>
      <Switch {...args} defaultChecked>
        Encendido
      </Switch>
    </Stack>
  ),
};

/** Se enfoca con Tab y cambia con Espacio. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: NAME });
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
  },
};

/**
 * Sin `checked`, el navegador guarda el estado y el interruptor viaja en el `<form>`
 * con su `name`. El `<form>` es imprescindible aquí y esta historia nunca se carga en
 * nativo.
 */
export const EnFormulario: Story = {
  args: { name: 'preventas' },
  render: (args) => (
    <form aria-label="Avisos" onSubmit={(event) => event.preventDefault()}>
      <Switch {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole<HTMLFormElement>('form', { name: 'Avisos' });
    await expect(new FormData(form).get('preventas')).toBeNull();
    await userEvent.click(canvas.getByRole('switch', { name: NAME }));
    await expect(new FormData(form).get('preventas')).toBe('on');
  },
};
