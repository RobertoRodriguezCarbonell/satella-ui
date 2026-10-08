import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Formularios/Checkbox',
  component: Checkbox,
  parameters: { maturity: 'experimental' },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    children: 'Acepto las condiciones de compra',
    onCheckedChange: fn(),
  },
  // La casilla ocupa lo que mide con su etiqueta, igual en web y en nativo.
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

/** Se marca y se desmarca al pulsar la casilla o su etiqueta, y avisa con el estado nuevo. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: NAME });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(canvas.getByText(NAME));
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};

export const Marcada: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: NAME })).toBeChecked();
  },
};

/** Ni marcada ni sin marcar: representa a un grupo donde solo algunas opciones lo están. */
export const Indeterminada: Story = {
  args: { indeterminate: true, children: 'Todas las zonas' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Todas las zonas' })).toBePartiallyChecked();
  },
};

/** Sin etiqueta visible necesita `accessibilityLabel`, por ejemplo en una fila de una tabla. */
export const SinEtiqueta: Story = {
  args: { children: undefined, accessibilityLabel: 'Seleccionar entrada 1' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('checkbox', { name: 'Seleccionar entrada 1' }),
    ).toBeInTheDocument();
  },
};

/** Inválida: el borde de error avisa de que falta marcarla. */
export const Invalida: Story = {
  args: { invalid: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: NAME })).toBeInvalid();
  },
};

/** Deshabilitada no se puede pulsar ni enfocar. */
export const Deshabilitada: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: NAME });
    await expect(checkbox).toBeDisabled();
    await userEvent.click(canvas.getByText(NAME));
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

/** Con una etiqueta larga, la casilla se queda alineada con la primera línea. */
export const EtiquetaLarga: Story = {
  args: {
    children:
      'Quiero recibir por correo las novedades de los recintos que sigo y los avisos de preventa antes de que salgan a la venta general',
  },
};

const ZONES = ['Pista', 'Grada', 'Palco'] as const;

/**
 * Controlada: la casilla de arriba resume a las demás. Está indeterminada cuando solo
 * algunas están marcadas, y pulsarla las marca o las desmarca todas.
 */
export const SeleccionarTodo: Story = {
  args: { children: 'Todas las zonas' },
  render: function SeleccionarTodo(args) {
    const [selected, setSelected] = useState<readonly string[]>(['Pista']);
    const all = selected.length === ZONES.length;
    return (
      <Stack gap={2}>
        <Checkbox
          {...args}
          checked={all}
          indeterminate={selected.length > 0 && !all}
          onCheckedChange={(checked) => setSelected(checked ? ZONES : [])}
        />
        <Stack gap={2} paddingX={6}>
          {ZONES.map((zone) => (
            <Checkbox
              key={zone}
              checked={selected.includes(zone)}
              onCheckedChange={(checked) =>
                setSelected(checked ? [...selected, zone] : selected.filter((z) => z !== zone))
              }
            >
              {zone}
            </Checkbox>
          ))}
        </Stack>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const all = canvas.getByRole('checkbox', { name: 'Todas las zonas' });
    await expect(all).toBePartiallyChecked();
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Palco' })).toBeChecked();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Grada' }));
    await expect(all).toBePartiallyChecked();
  },
};

/** Todos los estados, sin marcar y marcada. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5}>
      {(
        [
          ['Normal', {}],
          ['Inválida', { invalid: true }],
          ['Deshabilitada', { disabled: true }],
        ] as const
      ).map(([name, props]) => (
        <Stack key={name} gap={2}>
          <Text variant="label" color="muted">
            {name}
          </Text>
          <Stack direction="row" gap={5} wrap>
            <Checkbox {...props}>Sin marcar</Checkbox>
            <Checkbox {...props} defaultChecked>
              Marcada
            </Checkbox>
            <Checkbox {...props} indeterminate>
              Indeterminada
            </Checkbox>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
