import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Tabs } from './Tabs';
import type { TabItem } from './Tabs.types';

const STEPS: readonly TabItem[] = [
  { value: 'entradas', label: 'Entradas', content: 'Elige tus entradas.' },
  { value: 'extras', label: 'Extras', disabled: true, content: 'Añade extras.' },
  { value: 'datos', label: 'Tus datos', content: 'Escribe tus datos.' },
  { value: 'pago', label: 'Pago', content: 'Paga la compra.' },
];

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS y del
 * teclado. Las fuerza `storybook-addon-pseudo-states`, así quedan fijas en el
 * catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Superficies/Tabs/Estados web',
  component: Tabs,
  parameters: { maturity: 'experimental' },
  args: { items: STEPS, accessibilityLabel: 'Pasos de la compra', onValueChange: fn() },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
};

/** El anillo de foco se dibuja hacia dentro, en las pestañas y en el panel. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
};

/**
 * Tab entra en la pestaña elegida y el siguiente Tab va al panel: entre pestañas se va
 * con las flechas, que saltan las deshabilitadas y dan la vuelta. Inicio y Fin van a
 * los extremos.
 */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const tab = (name: string) => canvas.getByRole('tab', { name });
    await userEvent.tab();
    await expect(tab('Entradas')).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Tus datos')).toHaveFocus();
    await expect(tab('Tus datos')).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('datos');

    await userEvent.keyboard('{End}');
    await expect(tab('Pago')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Entradas')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tab('Pago')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(tab('Entradas')).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel', { name: 'Entradas' })).toHaveFocus();
  },
};

/** Solo la pestaña elegida está en el orden de tabulación. */
export const UnSoloTabulador: Story = {
  args: { defaultValue: 'datos' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: 'Tus datos' })).toHaveAttribute('tabindex', '0');
    await expect(canvas.getByRole('tab', { name: 'Entradas' })).toHaveAttribute('tabindex', '-1');
    await expect(canvas.getByRole('tab', { name: 'Pago' })).toHaveAttribute('tabindex', '-1');
  },
};
