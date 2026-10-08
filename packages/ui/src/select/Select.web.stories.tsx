import type { SelectOption } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Select } from './Select';

const CITIES: readonly SelectOption[] = [
  { value: 'mad', label: 'Madrid' },
  { value: 'bcn', label: 'Barcelona' },
  { value: 'vlc', label: 'Valencia' },
];

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del
 * teclado y de un `<form>`. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Formularios/Select/Estados web',
  component: Select,
  parameters: { maturity: 'experimental' },
  args: {
    options: CITIES,
    accessibilityLabel: 'Ciudad',
    placeholder: 'Elige una ciudad',
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** El foco se dibuja en toda la caja; si el campo es inválido, con el color de error. */
export const Foco: Story = {
  parameters: { pseudo: { focusWithin: true } },
  render: (args) => (
    <Stack gap={4}>
      <Select {...args} />
      <Select {...args} invalid accessibilityLabel="Ciudad inválida" />
    </Stack>
  ),
};

/** Se enfoca con Tab. Las flechas y la búsqueda al teclear son las del `<select>` del navegador. */
export const Teclado: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('combobox', { name: 'Ciudad' })).toHaveFocus();
  },
};

/** La opción "sin elegir" no aparece en la lista: una vez elegida una, no se puede volver atrás. */
export const SinElegir: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByRole<HTMLSelectElement>('combobox', { name: 'Ciudad' });
    const [empty] = Array.from(select.options);
    await expect(empty).toHaveTextContent('Elige una ciudad');
    await expect(empty).toBeDisabled();
    await expect(empty).not.toBeVisible();
  },
};

/**
 * El campo viaja en el `<form>` con su `name` y el `value` de la opción. El `<form>` es
 * imprescindible aquí y esta historia nunca se carga en nativo.
 */
export const EnFormulario: Story = {
  args: { name: 'ciudad' },
  render: (args) => (
    <form aria-label="Preferencias" onSubmit={(event) => event.preventDefault()}>
      <Select {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole<HTMLFormElement>('form', { name: 'Preferencias' });
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Ciudad' }), 'Valencia');
    await expect(new FormData(form).get('ciudad')).toBe('vlc');
  },
};
