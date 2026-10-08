import { feedbackTones } from '@satellatickets/core';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Link } from '../link';
import { Stack } from '../stack';
import { Text } from '../text';
import { Alert } from './Alert';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: { maturity: 'experimental' },
  argTypes: {
    tone: { control: 'select', options: feedbackTones },
    title: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    tone: 'info',
    title: 'Las entradas se envían por correo',
    children: 'Revisa también la carpeta de correo no deseado.',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `info` espera a que el lector de pantalla termine de leer antes de anunciarse. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const alert = canvas.getByRole('status');
    await expect(alert).toHaveTextContent('Las entradas se envían por correo');
    await expect(alert).toHaveTextContent('Revisa también la carpeta de correo no deseado.');
  },
};

/**
 * Cada tono tiene su color y su icono. `danger` y `warning` interrumpen al lector de
 * pantalla (`alert`); `success` e `info` esperan (`status`).
 */
export const Tonos: Story = {
  render: () => (
    <Stack gap={3}>
      <Alert tone="success" title="Compra completada">
        Te hemos enviado las entradas a ana@correo.com.
      </Alert>
      <Alert tone="warning" title="Quedan pocas entradas">
        Solo quedan 4 en la zona que has elegido.
      </Alert>
      <Alert tone="danger" title="No se ha podido cobrar">
        Tu banco ha rechazado el pago. Prueba con otra tarjeta.
      </Alert>
      <Alert tone="info" title="Apertura de puertas a las 20:00">
        Con la entrada puedes acceder hasta las 22:30.
      </Alert>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(2);
    await expect(canvas.getAllByRole('status')).toHaveLength(2);
  },
};

/** Solo el título, para un aviso de una línea. */
export const SoloTitulo: Story = {
  args: { tone: 'success', title: 'Cambios guardados', children: undefined },
};

/** Solo la descripción: el texto se alinea con el icono. */
export const SoloDescripcion: Story = {
  args: {
    tone: 'warning',
    title: undefined,
    children: 'El recinto no admite mochilas ni botellas.',
  },
};

/** Con `onClose` muestra un botón de cierre. Su nombre lo pone la app con `closeLabel`. */
export const ConCierre: Story = {
  args: { onClose: fn(), closeLabel: 'Cerrar aviso' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar aviso' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** La descripción admite contenido, por ejemplo un enlace con el siguiente paso. */
export const ConEnlace: Story = {
  args: { tone: 'danger', title: 'Tu sesión ha caducado' },
  render: (args) => (
    <Alert {...args}>
      <Text variant="bodySmall" color="primary">
        {'Las entradas siguen reservadas 5 minutos. '}
        <Link href="https://satellatickets.com/entrar" color="primary">
          Inicia sesión
        </Link>
        {' para terminar la compra.'}
      </Text>
    </Alert>
  ),
};

/** Un texto largo ocupa varias líneas; el icono y el cierre se quedan arriba. */
export const TextoLargo: Story = {
  args: {
    tone: 'warning',
    title: 'El concierto de Noche Satella cambia de recinto y de hora de apertura de puertas',
    children:
      'Por obras en la sala, el concierto se traslada al Palacio de Congresos. Tus entradas siguen siendo válidas y no tienes que hacer nada. Si no puedes asistir, puedes pedir la devolución hasta 48 horas antes.',
    onClose: fn(),
    closeLabel: 'Cerrar aviso',
  },
};

/** Todos los tonos, con y sin cierre. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={3}>
      {feedbackTones.map((tone) => (
        <Alert key={tone} tone={tone} title={`Aviso ${tone}`}>
          Texto de apoyo del aviso.
        </Alert>
      ))}
      {feedbackTones.map((tone) => (
        <Alert
          key={`${tone}-cierre`}
          tone={tone}
          title={`Aviso ${tone} con cierre`}
          onClose={() => undefined}
          closeLabel={`Cerrar aviso ${tone}`}
        />
      ))}
    </Stack>
  ),
};
