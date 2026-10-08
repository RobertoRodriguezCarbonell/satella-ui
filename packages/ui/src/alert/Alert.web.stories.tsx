import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Alert } from './Alert';

/** Historias solo web (ADR-012): el cierre con teclado. */
const meta = {
  title: 'Feedback/Alert/Estados web',
  component: Alert,
  parameters: { maturity: 'experimental' },
  args: {
    tone: 'info',
    title: 'Las entradas se envían por correo',
    onClose: fn(),
    closeLabel: 'Cerrar aviso',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** El botón de cierre se alcanza con Tab y se activa con Intro. */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Cerrar aviso' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** El anillo de foco del botón de cierre sobre el fondo del aviso. */
export const FocoEnElCierre: Story = {
  parameters: { pseudo: { focusVisible: true } },
};
