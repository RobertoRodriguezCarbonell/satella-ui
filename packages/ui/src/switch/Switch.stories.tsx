import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Switch } from './Switch';

const meta = {
  title: 'Formularios/Switch',
  component: Switch,
  parameters: { maturity: 'experimental' },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Avisarme de las preventas',
    onCheckedChange: fn(),
  },
  // El interruptor ocupa lo que mide con su etiqueta, igual en web y en nativo.
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

/** Se activa y se desactiva al pulsarlo o al pulsar su etiqueta, y avisa con el estado nuevo. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: NAME });
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(canvas.getByText(NAME));
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};

export const Activado: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch', { name: NAME })).toBeChecked();
  },
};

/** Sin etiqueta visible necesita `accessibilityLabel`. */
export const SinEtiqueta: Story = {
  args: { children: undefined, accessibilityLabel: 'Modo oscuro' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch', { name: 'Modo oscuro' })).toBeInTheDocument();
  },
};

/** Deshabilitado no se puede pulsar ni enfocar. */
export const Deshabilitado: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const control = canvas.getByRole('switch', { name: NAME });
    await expect(control).toBeDisabled();
    await userEvent.click(canvas.getByText(NAME));
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

/** Controlado: con `checked`, manda la app. Aquí el texto de debajo refleja el estado. */
export const Controlado: Story = {
  render: function Controlado(args) {
    const [on, setOn] = useState(false);
    return (
      <Stack gap={2}>
        <Switch
          {...args}
          checked={on}
          onCheckedChange={(checked) => {
            setOn(checked);
            args.onCheckedChange?.(checked);
          }}
        />
        <Text variant="caption" color="muted">
          {on ? 'Te avisaremos por correo.' : 'No recibirás avisos.'}
        </Text>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('No recibirás avisos.')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('switch', { name: NAME }));
    await expect(canvas.getByText('Te avisaremos por correo.')).toBeInTheDocument();
  },
};

/** Todos los estados, apagado y encendido. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5}>
      {(
        [
          ['Normal', {}],
          ['Deshabilitado', { disabled: true }],
        ] as const
      ).map(([name, props]) => (
        <Stack key={name} gap={2}>
          <Text variant="label" color="muted">
            {name}
          </Text>
          <Stack direction="row" gap={5} wrap>
            <Switch {...props}>Apagado</Switch>
            <Switch {...props} defaultChecked>
              Encendido
            </Switch>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
