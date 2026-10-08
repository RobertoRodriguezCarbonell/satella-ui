import type { ToastOptions } from '@satellatickets/core';
import { expect, waitFor } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Button } from '../button';
import { Stack } from '../stack';
import { UIProvider } from '../ui-provider';
import { useToast } from './index';

interface LauncherProps extends ToastOptions {
  trigger: string;
}

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

/** Historias solo web (ADR-012): la pausa con el puntero, el teclado y los proveedores anidados. */
const meta = {
  title: 'Feedback/Toast/Estados web',
  component: Launcher,
  parameters: { maturity: 'experimental' },
  args: { trigger: 'Copiar enlace', tone: 'info', title: 'Enlace copiado' },
} satisfies Meta<typeof Launcher>;

export default meta;
type Story = StoryObj<typeof meta>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mientras el puntero está sobre los toasts no se cierran: da tiempo a leerlos. */
export const PausaConElPuntero: Story = {
  // Un segundo y medio: tiempo de sobra para llegar con el puntero incluso con el runner cargado.
  args: { duration: 1500 },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copiar enlace' }));
    const toast = await canvas.findByRole('status');
    await userEvent.hover(toast);
    // Más de lo que dura: si sigue ahí, es que el cierre está en pausa.
    await wait(2000);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.unhover(toast);
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull(), { timeout: 8000 });
  },
};

/** El botón de cierre se alcanza con Tab después del contenido de la página. */
export const Teclado: Story = {
  args: { duration: 0, closeLabel: 'Cerrar aviso' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copiar enlace' }));
    await canvas.findByRole('status');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Cerrar aviso' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByRole('status')).toBeNull();
  },
};

/**
 * Un `UIProvider` anidado, por ejemplo para cambiar de marca en una sección, usa la
 * zona de avisos del de fuera: no aparece una segunda.
 */
export const ProveedorAnidado: Story = {
  args: { duration: 0 },
  render: (args) => (
    <UIProvider theme="dark" brand="organizer">
      <Launcher {...args} />
    </UIProvider>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copiar enlace' }));
    await canvas.findByRole('status');
    await expect(canvasElement.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
  },
};
