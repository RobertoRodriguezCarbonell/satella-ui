import type { SelectOption } from '@satellatickets/core';
import { useState } from 'react';
import { expect, fn, type userEvent } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Box } from '../box';
import { Button } from '../button';
import { FormField } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';
import { Select } from './Select';

const CITIES: readonly SelectOption[] = [
  { value: 'mad', label: 'Madrid' },
  { value: 'bcn', label: 'Barcelona' },
  { value: 'vlc', label: 'Valencia' },
  { value: 'svq', label: 'Sevilla', disabled: true },
  { value: 'bio', label: 'Bilbao' },
];

const PROVINCES: readonly SelectOption[] = [
  'A Coruña',
  'Álava',
  'Albacete',
  'Alicante',
  'Almería',
  'Asturias',
  'Ávila',
  'Badajoz',
  'Barcelona',
  'Bizkaia',
  'Burgos',
  'Cáceres',
  'Cádiz',
  'Cantabria',
  'Castellón',
  'Ciudad Real',
  'Córdoba',
  'Cuenca',
  'Gipuzkoa',
  'Girona',
  'Granada',
  'Guadalajara',
  'Huelva',
  'Huesca',
].map((label) => ({ value: label, label }));

/**
 * Historias solo web (ADR-012): el teclado, la posición de la lista, las pseudo-clases
 * CSS y un `<form>`. En nativo la lista es un modal y no hay nada de esto.
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
type UserEvent = ReturnType<typeof userEvent.setup>;

/** Las historias que dejan la lista abierta capturan el lienzo entero, en uno pequeño. */
const openList = {
  parameters: { visual: 'canvas' },
  globals: { viewport: { value: 'dialogo' } },
} satisfies Partial<Story>;

/** La opción resaltada: la que señala `aria-activedescendant` desde el disparador. */
function highlighted(select: HTMLElement): HTMLElement | null {
  const id = select.getAttribute('aria-activedescendant');
  return id === null ? null : document.getElementById(id);
}

/**
 * Lleva el puntero al centro de un elemento. Con coordenadas, como un ratón de verdad:
 * la lista solo hace caso al puntero cuando cambia de sitio.
 */
async function pointAt(userEvent: UserEvent, target: HTMLElement) {
  const { left, top, width, height } = target.getBoundingClientRect();
  await userEvent.pointer({
    target,
    coords: { clientX: left + width / 2, clientY: top + height / 2 },
  });
}

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

/**
 * Se enfoca con Tab y la flecha la abre. Las flechas mueven el resaltado, que se dibuja
 * con el contorno de foco y salta las opciones deshabilitadas; Intro elige. El foco no
 * sale del disparador.
 */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await userEvent.tab();
    await expect(select).toHaveFocus();

    // Sin opción elegida, al abrir no hay ninguna resaltada.
    await userEvent.keyboard('{ArrowDown}');
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    await expect(highlighted(select)).toBeNull();

    await userEvent.keyboard('{ArrowDown}');
    await expect(highlighted(select)).toHaveTextContent('Madrid');
    await userEvent.keyboard('{End}');
    await expect(highlighted(select)).toHaveTextContent('Bilbao');
    // No da la vuelta, y salta Sevilla, que está deshabilitada.
    await userEvent.keyboard('{ArrowDown}');
    await expect(highlighted(select)).toHaveTextContent('Bilbao');
    await userEvent.keyboard('{ArrowUp}');
    await expect(highlighted(select)).toHaveTextContent('Valencia');

    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('vlc');
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    await expect(select).toHaveFocus();
  },
};

/** El resaltado del teclado, con su contorno. Al abrirla, la opción elegida es la resaltada. */
export const ResaltadoConTeclado: Story = {
  ...openList,
  args: { defaultValue: 'mad' },
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(highlighted(select)).toHaveTextContent('Madrid');
    await userEvent.keyboard('{ArrowDown}');
    await expect(highlighted(select)).toHaveTextContent('Barcelona');
  },
};

/** Con el puntero, la opción resaltada es la que tiene debajo, sin contorno. */
export const ResaltadoConPuntero: Story = {
  ...openList,
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await userEvent.click(select);
    await pointAt(userEvent, canvas.getByRole('option', { name: 'Barcelona' }));
    await expect(highlighted(select)).toHaveTextContent('Barcelona');
    // Una opción deshabilitada no se resalta.
    await pointAt(userEvent, canvas.getByRole('option', { name: 'Sevilla' }));
    await expect(highlighted(select)).toHaveTextContent('Barcelona');
  },
};

/** Escape la cierra sin elegir; pulsar fuera y perder el foco, también. */
export const CerrarSinElegir: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Select {...args} />
      <Text color="muted">Fuera del campo</Text>
    </Stack>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });

    await userEvent.click(select);
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(select).toHaveFocus();

    await userEvent.click(select);
    await expect(canvas.getByRole('listbox')).toBeVisible();
    await userEvent.click(canvas.getByText('Fuera del campo'));
    await expect(canvas.queryByRole('listbox')).toBeNull();

    // Pulsar el disparador con la lista abierta también la cierra.
    await userEvent.click(select);
    await userEvent.click(select);
    await expect(canvas.queryByRole('listbox')).toBeNull();

    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(select).toHaveTextContent('Elige una ciudad');
  },
};

/** Tab elige la opción resaltada y pasa al control siguiente. */
export const ElegirConTab: Story = {
  render: (args) => (
    <Stack gap={4} align="start">
      <Select {...args} />
      <Button variant="secondary">Continuar</Button>
    </Stack>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await userEvent.tab();
    await userEvent.keyboard('{Home}');
    await expect(highlighted(select)).toHaveTextContent('Madrid');
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('mad');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Continuar' })).toHaveFocus();
  },
};

/**
 * Escribir busca la opción que empieza por ese texto, sin distinguir mayúsculas ni
 * acentos. La misma letra varias veces recorre las que empiezan por ella.
 */
export const BuscarEscribiendo: Story = {
  args: { options: PROVINCES, accessibilityLabel: 'Provincia', placeholder: 'Elige una provincia' },
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Provincia' });
    await userEvent.tab();

    // Cerrada, escribir la abre ya en la coincidencia.
    await userEvent.keyboard('av');
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    await expect(highlighted(select)).toHaveTextContent('Ávila');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('Ávila');

    // El espacio, en mitad de una búsqueda, es una letra más.
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('ciudad r');
    await expect(highlighted(select)).toHaveTextContent('Ciudad Real');
    await userEvent.keyboard('{Escape}');
  },
};

/** La lista solo contiene las opciones: una vez elegida una, no se puede volver a "sin elegir". */
export const SinElegir: Story = {
  ...openList,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Ciudad' }));
    const labels = canvas.getAllByRole('option').map((option) => option.textContent);
    await expect(labels).toEqual(CITIES.map((city) => city.label));
  },
};

/**
 * Una lista larga se limita a unas siete opciones y el resto se desplaza. La opción
 * resaltada siempre queda a la vista.
 */
export const ListaLarga: Story = {
  ...openList,
  args: {
    options: PROVINCES,
    accessibilityLabel: 'Provincia',
    placeholder: 'Elige una provincia',
    defaultValue: 'Cuenca',
  },
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Provincia' });
    await userEvent.click(select);
    const list = canvas.getByRole('listbox', { name: 'Provincia' });
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

    // Al abrir, la elegida está a la vista aunque quede lejos del principio.
    const frame = list.getBoundingClientRect();
    const chosen = canvas.getByRole('option', { name: 'Cuenca' }).getBoundingClientRect();
    await expect(chosen.top).toBeGreaterThanOrEqual(frame.top);
    await expect(chosen.bottom).toBeLessThanOrEqual(frame.bottom);

    await userEvent.keyboard('{Home}');
    await expect(list.scrollTop).toBe(0);
  },
};

/** La lista sale bajo el campo, alineada con él y con su mismo ancho. */
export const Posicion: Story = {
  ...openList,
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await userEvent.click(select);
    const list = canvas.getByRole('listbox', { name: 'Ciudad' });
    const frame = list.getBoundingClientRect();
    // La caja del campo es el padre del disparador.
    const box = select.parentElement?.getBoundingClientRect();
    await expect(list).toHaveAttribute('data-side', 'bottom');
    await expect(frame.left).toBe(box?.left);
    await expect(frame.width).toBe(box?.width);
    await expect(frame.top).toBeGreaterThan(box?.bottom ?? 0);
  },
};

/** Si debajo no cabe y arriba hay más sitio, se abre hacia arriba. */
export const HaciaArriba: Story = {
  ...openList,
  args: { defaultValue: 'bcn' },
  render: (args) => (
    <Stack>
      {/* Empujan el campo hasta el final del lienzo. */}
      <Box paddingY={24} />
      <Box paddingY={24} />
      <Select {...args} />
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });
    await userEvent.click(select);
    const list = canvas.getByRole('listbox', { name: 'Ciudad' });
    await expect(list).toHaveAttribute('data-side', 'top');
    await expect(list.getBoundingClientRect().bottom).toBeLessThan(
      select.getBoundingClientRect().top,
    );
    await expect(list.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  },
};

/**
 * Dentro de un `FormField` la lista toma el nombre de la etiqueta. Pulsar la etiqueta
 * abre la lista, porque activa el disparador.
 */
export const EtiquetaDelFormField: Story = {
  ...openList,
  args: { accessibilityLabel: undefined },
  render: (args) => (
    <FormField label="Ciudad" help="Te enseñaremos primero los eventos de esa ciudad.">
      <Select {...args} />
    </FormField>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Ciudad'));
    await expect(canvas.getByRole('combobox', { name: 'Ciudad' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByRole('listbox', { name: 'Ciudad' })).toBeVisible();
  },
};

/**
 * Dentro de un `Modal` la lista se pinta por encima del diálogo y no la recorta su
 * contenido. Escape cierra la lista, no el diálogo.
 */
export const EnModal: Story = {
  ...openList,
  args: { accessibilityLabel: undefined },
  render: function EnModal(args) {
    const [open, setOpen] = useState(true);
    return (
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cambiar de ciudad"
        closeLabel="Cerrar"
        footer={<Button onPress={() => setOpen(false)}>Guardar</Button>}
      >
        <FormField label="Ciudad">
          <Select {...args} />
        </FormField>
      </Modal>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const dialog = await canvas.findByRole('dialog', { name: 'Cambiar de ciudad' });
    const select = canvas.getByRole('combobox', { name: 'Ciudad' });

    await userEvent.click(select);
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(dialog).toBeVisible();

    await userEvent.click(select);
    const list = canvas.getByRole('listbox', { name: 'Ciudad' });
    // La lista sobresale del diálogo y aun así se ve entera.
    await expect(list.getBoundingClientRect().bottom).toBeGreaterThan(
      dialog.getBoundingClientRect().bottom,
    );
    await expect(list).toBeVisible();
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
    await expect(new FormData(form).get('ciudad')).toBe('');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Ciudad' }));
    await userEvent.click(canvas.getByRole('option', { name: 'Valencia' }));
    await expect(new FormData(form).get('ciudad')).toBe('vlc');
  },
};
