import { useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Button } from '../button';
import { FormField } from '../form-field';
import { Input } from '../input';
import { Stack } from '../stack';
import { Text } from '../text';
import { Modal } from './Modal';

const meta = {
  title: 'Superficies/Modal',
  component: Modal,
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
    title: 'Devolver las entradas',
    description: 'Te devolveremos 48 € a la tarjeta con la que pagaste.',
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
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Devolver entradas
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={close}
          footer={
            args.footer ?? (
              <>
                <Button variant="ghost" onPress={close}>
                  Cancelar
                </Button>
                <Button variant="danger" onPress={close}>
                  Devolver
                </Button>
              </>
            )
          }
        />
      </Stack>
    );
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAME = 'Devolver las entradas';

/** Cerrado no pinta nada. Se abre cuando la app pone `open` a `true`. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Devolver entradas' }));
    const dialog = await canvas.findByRole('dialog', { name: NAME });
    await expect(dialog).toHaveAccessibleDescription(
      'Te devolveremos 48 € a la tarjeta con la que pagaste.',
    );
  },
};

/** Abierto: centrado sobre un fondo que deja inerte el resto de la página. */
export const Abierto: Story = {
  args: { open: true },
  // El diálogo se pinta fuera de la caja de la historia: se captura el lienzo entero.
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('dialog', { name: NAME })).toBeVisible();
  },
};

/** El botón de cierre pide cerrar con `onClose`; la app responde poniendo `open` a `false`. */
export const CerrarConElBoton: Story = {
  args: { open: true },
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('dialog', { name: NAME });
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/** Las acciones del pie son contenido de la app: aquí cierran el diálogo. */
export const CerrarConUnaAccion: Story = {
  args: { open: true },
  play: async ({ canvas, userEvent }) => {
    await canvas.findByRole('dialog', { name: NAME });
    await userEvent.click(canvas.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/**
 * Con `dismissible={false}` no hay botón de cierre si la app no pasa `closeLabel`, y ni
 * Escape ni pulsar fuera lo cierran: hay que responder.
 */
export const NoDescartable: Story = {
  args: {
    open: true,
    dismissible: false,
    closeLabel: undefined,
    title: '¿Sigues ahí?',
    description: 'Tus entradas siguen reservadas 2 minutos más.',
  },
  render: function NoDescartable(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <Stack align="start">
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Reservar entradas
        </Button>
        <Modal
          {...args}
          open={open}
          footer={
            <Button
              onPress={() => {
                setOpen(false);
                args.onClose();
              }}
            >
              Seguir comprando
            </Button>
          }
        />
      </Stack>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('dialog', { name: '¿Sigues ahí?' });
    await expect(canvas.queryByRole('button', { name: 'Cerrar' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Seguir comprando' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/**
 * Solo el título y el contenido: sin descripción, sin pie y sin botón de cierre. Se cierra
 * tocando fuera, con Escape o con el botón atrás.
 */
export const SoloContenido: Story = {
  args: { open: true, description: undefined, closeLabel: undefined, title: 'Condiciones' },
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
  // `open` vive en la historia, como en una app. Si se quedara fijo en los args, el
  // diálogo no se podría cerrar, y en un móvil tapa también la navegación de Storybook.
  render: function SoloContenido(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <Stack align="start">
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Ver condiciones
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={() => {
            setOpen(false);
            args.onClose();
          }}
        >
          Las entradas no se pueden revender por encima de su precio.
        </Modal>
      </Stack>
    );
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('dialog', { name: 'Condiciones' })).toHaveTextContent(
      'Las entradas no se pueden revender por encima de su precio.',
    );
  },
};

/** Con un formulario dentro. Si el contenido no cabe, se desplaza él y el pie se queda a la vista. */
export const ConFormulario: Story = {
  args: {
    open: true,
    title: 'Cambiar el titular',
    description: 'El nombre aparecerá en la entrada.',
  },
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
  render: function ConFormulario(args) {
    const [open, setOpen] = useState(args.open);
    const close = () => {
      setOpen(false);
      args.onClose();
    };
    return (
      <Stack align="start">
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Cambiar el titular
        </Button>
        <Modal
          {...args}
          open={open}
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onPress={close}>
                Cancelar
              </Button>
              <Button onPress={close}>Guardar</Button>
            </>
          }
        >
          <Stack gap={4}>
            <FormField label="Nombre y apellidos" required>
              <Input defaultValue="Ana García" />
            </FormField>
            <FormField label="Documento" help="DNI, NIE o pasaporte.">
              <Input />
            </FormField>
            <Text variant="caption" color="muted">
              Puedes cambiarlo hasta 24 horas antes del evento.
            </Text>
          </Stack>
        </Modal>
      </Stack>
    );
  },
  play: async ({ canvas }) => {
    const dialog = await canvas.findByRole('dialog', { name: 'Cambiar el titular' });
    await expect(dialog).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Nombre y apellidos' })).toHaveValue(
      'Ana García',
    );
  },
};
