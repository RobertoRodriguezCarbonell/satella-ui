import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Button } from '../button';
import { FormField } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';
import { DatePicker } from './DatePicker';

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del teclado y
 * de la capa superior del navegador. Las fuerza `storybook-addon-pseudo-states`, así
 * quedan fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Fechas/DatePicker/Estados web',
  component: DatePicker,
  parameters: { maturity: 'experimental' },
  args: {
    locale: 'es',
    // El 9 de octubre de 2026 es viernes.
    today: '2026-10-09',
    previousMonthLabel: 'Mes anterior',
    nextMonthLabel: 'Mes siguiente',
    accessibilityLabel: 'Fecha del evento',
    placeholder: 'Elige una fecha',
    onValueChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Las historias que dejan el calendario abierto capturan el lienzo entero, en uno pequeño. */
const openCalendar = {
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
} satisfies Partial<Story>;

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

/** El foco se dibuja en toda la caja; si el campo es inválido, con el color de error. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true, focusWithin: true } },
};

/** El calendario sale bajo el campo, alineado con su borde izquierdo, con el día de hoy marcado. */
export const Abierto: Story = {
  ...openCalendar,
  args: { defaultValue: '2026-10-15' },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await userEvent.click(field);
    const calendar = canvas.getByRole('dialog', { name: 'Fecha del evento' });
    const frame = calendar.getBoundingClientRect();
    // La caja del campo es el padre del disparador.
    const box = field.parentElement?.getBoundingClientRect();
    await expect(calendar).toHaveAttribute('data-side', 'bottom');
    await expect(frame.left).toBe(box?.left);
    await expect(frame.top).toBeGreaterThan(box?.bottom ?? 0);
    // Abierto, la caja se dibuja como enfocada aunque el foco esté en el calendario.
    await expect(getComputedStyle(field.parentElement ?? field).outlineStyle).toBe('solid');
    // Al abrirse, el foco pasa al día elegido.
    await expect(
      canvas.getByRole('button', { name: 'jueves, 15 de octubre de 2026' }),
    ).toHaveFocus();
  },
};

/**
 * Con el foco en el campo, la flecha abajo, Intro o Espacio abren el calendario y el foco
 * pasa al día elegido, o a hoy. Dentro, el teclado es el de la rejilla de fechas; Intro
 * elige, cierra y devuelve el foco al campo.
 */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    const day = (name: string) => canvas.getByRole('button', { name });
    await userEvent.tab();
    await expect(field).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(day('viernes, 9 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(day('sábado, 17 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-10-17');
    await expect(field).toHaveFocus();
    await expect(field).toHaveTextContent(/^17 oct\.? 2026$/);
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());

    // Al reabrirlo, el foco va al día elegido. Otro mes se alcanza con AvPág.
    await userEvent.keyboard('{Enter}');
    await expect(day('sábado, 17 de octubre de 2026')).toHaveFocus();
    await userEvent.keyboard('{PageDown} ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('2026-11-17');
    await expect(field).toHaveFocus();
  },
};

/** Escape lo cierra sin cambiar nada y devuelve el foco; pulsar fuera y salir con el tabulador, también. */
export const CerrarSinElegir: Story = {
  args: { defaultValue: '2026-10-15' },
  render: (args) => (
    <Stack gap={4} align="start">
      <DatePicker {...args} />
      <Text color="muted">Fuera del campo</Text>
      <Button variant="secondary">Otro control</Button>
    </Stack>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    // El calendario se va con un fundido y entonces deja de existir.
    const closed = () => waitFor(() => expect(canvasElement.querySelector('[popover]')).toBeNull());

    await userEvent.click(field);
    await userEvent.keyboard('{ArrowRight}{Escape}');
    await closed();
    await expect(field).toHaveFocus();

    await userEvent.click(field);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.click(canvas.getByText('Fuera del campo'));
    await closed();

    // Pulsar el campo con el calendario abierto también lo cierra.
    await userEvent.click(field);
    await userEvent.click(field);
    await expect(field).toHaveAttribute('aria-expanded', 'false');

    // Reabierto antes de que termine de irse, empieza de nuevo en el día elegido, no en
    // el que tenía el foco la vez anterior.
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await userEvent.click(field);
    await userEvent.click(field);
    await expect(
      canvas.getByRole('button', { name: 'jueves, 15 de octubre de 2026' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await closed();

    // El tabulador recorre el calendario y, al salir de él, lo cierra.
    await userEvent.click(field);
    await expect(
      canvas.getByRole('button', { name: 'jueves, 15 de octubre de 2026' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Otro control' })).toHaveFocus();
    await closed();

    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(field).toHaveTextContent(/^15 oct\.? 2026$/);
    await expect(canvasElement.querySelector('[popover]')).toBeNull();
  },
};

/** Pulsar la fecha que ya estaba elegida la confirma: cierra sin avisar de ningún cambio. */
export const ConfirmarLaMisma: Story = {
  args: { defaultValue: '2026-10-15' },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await userEvent.click(field);
    await userEvent.click(canvas.getByRole('button', { name: 'jueves, 15 de octubre de 2026' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(field).toHaveFocus();
  },
};

/** Si debajo no cabe y arriba hay más sitio, se abre hacia arriba. */
export const HaciaArriba: Story = {
  ...openCalendar,
  render: (args) => (
    <Stack>
      {/* Empujan el campo hasta el final del lienzo. */}
      <Box paddingY={24} />
      <Box paddingY={24} />
      <DatePicker {...args} />
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await userEvent.click(field);
    const calendar = canvas.getByRole('dialog', { name: 'Fecha del evento' });
    await expect(calendar).toHaveAttribute('data-side', 'top');
    await expect(calendar.getBoundingClientRect().bottom).toBeLessThan(
      field.getBoundingClientRect().top,
    );
    await expect(calendar.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  },
};

/** Un campo pegado al borde derecho: el calendario se corre hacia dentro para no salirse de la ventana. */
export const JuntoAlBorde: Story = {
  ...openCalendar,
  render: (args) => (
    <Stack direction="row" justify="end">
      <DatePicker {...args} style={{ width: 160 }} />
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });
    await userEvent.click(field);
    const frame = canvas.getByRole('dialog').getBoundingClientRect();
    await expect(frame.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
    await expect(frame.left).toBeLessThan(field.getBoundingClientRect().left);
  },
};

/**
 * Dentro de un `Modal`, el calendario sobresale del diálogo sin que este lo recorte, y
 * Escape cierra el calendario, no el diálogo.
 */
export const EnModal: Story = {
  ...openCalendar,
  args: { accessibilityLabel: undefined },
  render: function EnModal(args) {
    const [open, setOpen] = useState(true);
    return (
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cambiar la fecha"
        closeLabel="Cerrar"
        footer={<Button onPress={() => setOpen(false)}>Guardar</Button>}
      >
        <FormField label="Fecha del evento">
          <DatePicker {...args} />
        </FormField>
      </Modal>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const dialog = await canvas.findByRole('dialog', { name: 'Cambiar la fecha' });
    const field = canvas.getByRole('combobox', { name: 'Fecha del evento' });

    await userEvent.click(field);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(dialog).queryByRole('dialog')).toBeNull());
    await expect(dialog).toBeVisible();

    await userEvent.click(field);
    const calendar = within(dialog).getByRole('dialog', { name: 'Fecha del evento' });
    await expect(calendar.getBoundingClientRect().bottom).toBeGreaterThan(
      dialog.getBoundingClientRect().bottom,
    );
    await expect(calendar).toBeVisible();
  },
};

/**
 * La fecha viaja en el `<form>` con su `name`, como texto ISO. El `<form>` es
 * imprescindible aquí y esta historia nunca se carga en nativo.
 */
export const EnFormulario: Story = {
  args: { name: 'fecha' },
  render: (args) => (
    <form aria-label="Evento" onSubmit={(event) => event.preventDefault()}>
      <DatePicker {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByRole<HTMLFormElement>('form', { name: 'Evento' });
    await expect(new FormData(form).get('fecha')).toBe('');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Fecha del evento' }));
    await userEvent.click(canvas.getByRole('button', { name: 'martes, 20 de octubre de 2026' }));
    await expect(new FormData(form).get('fecha')).toBe('2026-10-20');
  },
};
