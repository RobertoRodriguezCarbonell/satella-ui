import { feedbackTones, type ToastItem, type ToastOptions } from '@satellatickets/core';
import { expect, fn, waitFor } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Button } from '../button';
import { Stack } from '../stack';
import { Text } from '../text';
import { Toast } from './Toast';
import { useToast } from './index';

interface LauncherProps extends ToastOptions {
  /** Texto del botón que lanza el toast. */
  trigger: string;
}

/** Los toasts no se colocan: se lanzan desde un manejador con `useToast` (ADR-039). */
function Launcher({ trigger, ...options }: LauncherProps) {
  const toast = useToast();
  return (
    // El botón ocupa lo que mide su contenido, igual en web y en nativo.
    <Stack align="start">
      <Button variant="secondary" onPress={() => toast.show(options)}>
        {trigger}
      </Button>
    </Stack>
  );
}

const meta = {
  title: 'Feedback/Toast',
  component: Launcher,
  parameters: { maturity: 'experimental' },
  argTypes: {
    tone: { control: 'select', options: feedbackTones },
    title: { control: 'text' },
    description: { control: 'text' },
    duration: { control: 'number' },
    closeLabel: { control: 'text' },
  },
  args: {
    trigger: 'Guardar cambios',
    tone: 'success',
    title: 'Cambios guardados',
  },
} satisfies Meta<typeof Launcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `show` lo muestra en la zona de avisos de `UIProvider`. Desaparece solo a los 5 segundos. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Guardar cambios' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent('Cambios guardados');
  },
};

/** `danger` y `warning` interrumpen al lector de pantalla (`alert`); `success` e `info` esperan (`status`). */
export const Tonos: Story = {
  render: () => (
    <Stack direction="row" gap={3} wrap>
      <Launcher trigger="success" tone="success" title="Entradas enviadas a tu correo" />
      <Launcher trigger="warning" tone="warning" title="Quedan 4 entradas en esta zona" />
      <Launcher trigger="danger" tone="danger" title="No se ha podido cobrar" />
      <Launcher trigger="info" tone="info" title="Las puertas abren a las 20:00" />
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'danger' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent('No se ha podido cobrar');
    await userEvent.click(canvas.getByRole('button', { name: 'info' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Las puertas abren a las 20:00',
    );
  },
};

export const ConDescripcion: Story = {
  args: {
    trigger: 'Comprar',
    title: 'Compra completada',
    description: 'Te hemos enviado las entradas a ana@correo.com.',
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Comprar' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Te hemos enviado las entradas a ana@correo.com.',
    );
  },
};

/** La acción llama a su `onPress` y cierra el toast. */
export const ConAccion: Story = {
  args: {
    trigger: 'Quitar del carrito',
    tone: 'info',
    title: 'Entrada quitada del carrito',
    action: { label: 'Deshacer', onPress: fn() },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Quitar del carrito' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Deshacer' }));
    await expect(args.action?.onPress).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('status')).toBeNull();
  },
};

/** Con `closeLabel` muestra un botón de cierre. Con `duration: 0` no se cierra solo. */
export const ConCierre: Story = {
  args: {
    trigger: 'Reintentar el pago',
    tone: 'danger',
    title: 'No se ha podido cobrar',
    description: 'Tu banco ha rechazado el pago.',
    duration: 0,
    closeLabel: 'Cerrar aviso',
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Reintentar el pago' }));
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar aviso' }));
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};

/** Pasada su `duration`, se cierra solo. */
export const SeCierraSolo: Story = {
  args: { trigger: 'Copiar enlace', tone: 'info', title: 'Enlace copiado', duration: 400 },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copiar enlace' }));
    await expect(await canvas.findByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull(), { timeout: 3000 });
  },
};

/** Como mucho hay tres a la vez: al llegar el cuarto, se retira el más antiguo. */
export const Apilados: Story = {
  args: { trigger: 'Añadir entrada', tone: 'success', title: 'Entrada añadida', duration: 0 },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Añadir entrada' });
    for (let count = 0; count < 4; count += 1) await userEvent.click(button);
    await expect(canvas.getAllByRole('status')).toHaveLength(3);
  },
};

const noop = () => undefined;

function card(overrides: Partial<ToastItem>): ToastItem {
  return {
    id: 'ejemplo',
    tone: 'info',
    title: 'Aviso',
    description: undefined,
    duration: 0,
    action: undefined,
    closeLabel: undefined,
    ...overrides,
  };
}

/**
 * El aspecto de la tarjeta en cada tono y con cada combinación de contenido, fuera de
 * la zona de avisos para poder verlas todas a la vez.
 */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5}>
      <Stack gap={2}>
        <Text variant="label" color="muted">
          Tonos
        </Text>
        {feedbackTones.map((tone) => (
          <Toast key={tone} toast={card({ tone, title: `Aviso ${tone}` })} onDismiss={noop} />
        ))}
      </Stack>
      <Stack gap={2}>
        <Text variant="label" color="muted">
          Contenido
        </Text>
        <Toast
          toast={card({
            tone: 'success',
            title: 'Compra completada',
            description: 'Te hemos enviado las entradas a ana@correo.com.',
          })}
          onDismiss={noop}
        />
        <Toast
          toast={card({
            title: 'Entrada quitada del carrito',
            action: { label: 'Deshacer', onPress: noop },
          })}
          onDismiss={noop}
        />
        <Toast
          toast={card({
            tone: 'danger',
            title: 'No se ha podido cobrar',
            description: 'Tu banco ha rechazado el pago. Prueba con otra tarjeta.',
            action: { label: 'Reintentar', onPress: noop },
            closeLabel: 'Cerrar aviso de pago',
          })}
          onDismiss={noop}
        />
      </Stack>
    </Stack>
  ),
};
