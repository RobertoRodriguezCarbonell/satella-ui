import { useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Button } from '../button';
import { Modal } from './Modal';

/**
 * Historias solo web (ADR-012): los gestos de cierre del `<dialog>`. El navegador
 * entrega Escape, y el botón atrás en Android, como un evento `cancel`; los tests
 * simulan el teclado sin pasar por el navegador, así que emiten ese evento a mano.
 */
const meta = {
  title: 'Superficies/Modal/Estados web',
  component: Modal,
  parameters: { maturity: 'experimental' },
  args: { open: true, title: 'Devolver las entradas', closeLabel: 'Cerrar', onClose: fn() },
  render: function Controlled(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <Modal
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
        footer={<Button onPress={() => setOpen(false)}>Entendido</Button>}
      />
    );
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAME = 'Devolver las entradas';

function cancel(dialog: HTMLElement) {
  dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
}

/** Es un `<dialog>` abierto con `showModal()`: el navegador lo pinta en su capa superior. */
export const DialogoNativo: Story = {
  play: async ({ canvas }) => {
    const dialog = await canvas.findByRole<HTMLDialogElement>('dialog', { name: NAME });
    await expect(dialog.tagName).toBe('DIALOG');
    await expect(dialog.open).toBe(true);
    await expect(dialog.matches(':modal')).toBe(true);
  },
};

/** Escape pide cerrar con `onClose`. */
export const Escape: Story = {
  play: async ({ args, canvas }) => {
    cancel(await canvas.findByRole('dialog', { name: NAME }));
    await expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/** Pulsar el fondo también: el fondo pertenece al propio `<dialog>`. */
export const ClicFuera: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const dialog = await canvas.findByRole('dialog', { name: NAME });
    await userEvent.click(dialog);
    await expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/** Pulsar dentro del diálogo no lo cierra. */
export const ClicDentro: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await canvas.findByRole('dialog', { name: NAME });
    await userEvent.click(canvas.getByRole('heading', { name: NAME }));
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(canvas.getByRole('dialog', { name: NAME })).toBeVisible();
  },
};

/** Con `dismissible={false}`, ni Escape ni pulsar fuera lo cierran. */
export const NoDescartable: Story = {
  args: { dismissible: false },
  play: async ({ args, canvas, userEvent }) => {
    const dialog = await canvas.findByRole<HTMLDialogElement>('dialog', { name: NAME });
    cancel(dialog);
    await userEvent.click(dialog);
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(dialog.open).toBe(true);
  },
};

/** Al abrirse, el foco entra en el diálogo. */
export const Foco: Story = {
  play: async ({ canvas }) => {
    const dialog = await canvas.findByRole('dialog', { name: NAME });
    await expect(dialog.contains(document.activeElement)).toBe(true);
  },
};

/**
 * Mientras está en pantalla, la página de detrás no se desplaza (ADR-044): el navegador
 * deja inerte lo de detrás, pero la rueda y el dedo lo seguirían moviendo. Al cerrarse,
 * la página vuelve a como estaba.
 */
export const BloqueaElDesplazamiento: Story = {
  play: async ({ canvas, userEvent }) => {
    const page = document.documentElement;
    await canvas.findByRole('dialog', { name: NAME });
    await expect(page.style.overflow).toBe('hidden');

    await userEvent.click(canvas.getByRole('button', { name: 'Entendido' }));
    await waitFor(() => expect(page.style.overflow).toBe(''));
    await expect(canvas.queryByRole('dialog')).toBeNull();
  },
};
