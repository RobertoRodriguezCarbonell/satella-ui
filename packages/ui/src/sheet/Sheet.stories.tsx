import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Stack } from '../stack';
import { Sheet } from './Sheet';

const meta = {
  title: 'Superficies/Sheet',
  component: Sheet,
  parameters: { maturity: 'experimental' },
  argTypes: {
    open: { control: false },
    title: { control: 'text' },
    description: { control: 'text' },
    closeLabel: { control: 'text' },
    dismissible: { control: 'boolean' },
    footer: { control: false },
    children: { control: false },
  },
  args: {
    open: false,
    title: 'Filtrar eventos',
    description: 'Elige qué tipos de evento quieres ver.',
    closeLabel: 'Cerrar',
    onClose: fn(),
  },
  // `open` lo decide la app: aquí lo guarda la historia y lo abre un botón.
  render: function Controlled(args) {
    const [open, setOpen] = useState(args.open);
    const close = () => {
      setOpen(false);
      args.onClose();
    };
    return (
      <Stack align="start">
        <Button variant="secondary" iconStart="settings" onPress={() => setOpen(true)}>
          Filtros
        </Button>
        <Sheet
          {...args}
          open={open}
          onClose={close}
          footer={<Button onPress={close}>Aplicar</Button>}
        >
          <Stack gap={3}>
            <Checkbox defaultChecked>Conciertos</Checkbox>
            <Checkbox defaultChecked>Festivales</Checkbox>
            <Checkbox>Teatro</Checkbox>
          </Stack>
        </Sheet>
      </Stack>
    );
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAME = 'Filtrar eventos';

/** Cerrado no pinta nada. Se abre cuando la app pone `open` a `true`. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Filtros' }));
    await expect(await canvas.findByRole('dialog', { name: NAME })).toBeVisible();
  },
};

/** Abierto: anclado al borde inferior y a todo el ancho. Es el mismo diálogo que `Modal`. */
export const Abierto: Story = {
  args: { open: true },
  // La hoja se pinta fuera de la caja de la historia: se captura el lienzo entero.
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('dialog', { name: NAME })).toBeVisible();
    await expect(canvas.getByRole('checkbox', { name: 'Conciertos' })).toBeChecked();
  },
};

/** El botón de cierre y las acciones del pie piden cerrar con `onClose`. */
export const Cerrar: Story = {
  args: { open: true },
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('dialog', { name: NAME });
    await userEvent.click(canvas.getByRole('button', { name: 'Aplicar' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('dialog')).toBeNull();
  },
};
