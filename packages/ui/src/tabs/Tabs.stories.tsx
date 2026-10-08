import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Text } from '../text';
import { Tabs } from './Tabs';
import type { TabItem } from './Tabs.types';

const ORDERS: readonly TabItem[] = [
  {
    value: 'proximas',
    label: 'Próximas',
    content: 'Tienes 2 entradas para eventos que aún no han pasado.',
  },
  { value: 'pasadas', label: 'Pasadas', content: 'Has ido a 14 eventos con Satella.' },
  { value: 'devueltas', label: 'Devueltas', content: 'No has devuelto ninguna entrada.' },
];

const meta = {
  title: 'Superficies/Tabs',
  component: Tabs,
  parameters: { maturity: 'experimental' },
  argTypes: {
    items: { control: 'object' },
    value: { control: 'text' },
  },
  args: {
    items: ORDERS,
    accessibilityLabel: 'Mis entradas',
    onValueChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empieza en la primera pestaña. Al elegir otra cambia el panel y avisa con su `value`. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('tab', { name: 'Próximas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Pasadas' }));
    await expect(canvas.getByRole('tab', { name: 'Pasadas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('tabpanel', { name: 'Pasadas' })).toHaveTextContent(
      'Has ido a 14 eventos con Satella.',
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith('pasadas');
  },
};

/** `defaultValue` elige la pestaña inicial. */
export const PestanaInicial: Story = {
  args: { defaultValue: 'devueltas' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tabpanel', { name: 'Devueltas' })).toBeInTheDocument();
  },
};

/** Los iconos son decorativos: acompañan al texto, no lo sustituyen. */
export const ConIconos: Story = {
  args: {
    accessibilityLabel: 'Buscar por',
    items: [
      { value: 'fecha', label: 'Fecha', icon: 'calendar' },
      { value: 'lugar', label: 'Lugar', icon: 'map-pin' },
      { value: 'artista', label: 'Artista', icon: 'user' },
    ],
  },
};

/** Una pestaña deshabilitada se ve, pero no se puede elegir. */
export const Deshabilitada: Story = {
  args: {
    items: [
      { value: 'entradas', label: 'Entradas', content: 'Elige tus entradas.' },
      { value: 'datos', label: 'Tus datos', content: 'Escribe tus datos.' },
      { value: 'pago', label: 'Pago', disabled: true, content: 'Paga la compra.' },
    ],
    accessibilityLabel: 'Pasos de la compra',
  },
  play: async ({ args, canvas, userEvent }) => {
    const tab = canvas.getByRole('tab', { name: 'Pago' });
    await expect(tab).toBeDisabled();
    await userEvent.click(tab);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

/**
 * Sin `content`, `Tabs` solo pinta las pestañas y la app decide qué mostrar. Aquí es
 * controlado y filtra un texto.
 */
export const SinPaneles: Story = {
  args: {
    accessibilityLabel: 'Filtrar eventos',
    items: [
      { value: 'hoy', label: 'Hoy' },
      { value: 'semana', label: 'Esta semana' },
      { value: 'mes', label: 'Este mes' },
    ],
  },
  render: function SinPaneles(args) {
    const [range, setRange] = useState('hoy');
    return (
      <Stack gap={4}>
        <Tabs
          {...args}
          value={range}
          onValueChange={(next) => {
            setRange(next);
            args.onValueChange?.(next);
          }}
        />
        <Text variant="bodySmall" color="secondary">
          {`Mostrando eventos de: ${range}`}
        </Text>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('tabpanel')).toBeNull();
    await userEvent.click(canvas.getByRole('tab', { name: 'Este mes' }));
    await expect(canvas.getByText('Mostrando eventos de: mes')).toBeInTheDocument();
  },
};

/** Si no caben, la lista se desplaza en horizontal en vez de partirse en dos filas. */
export const MuchasPestanas: Story = {
  args: {
    accessibilityLabel: 'Géneros',
    items: [
      'Pop',
      'Rock',
      'Electrónica',
      'Indie',
      'Flamenco',
      'Jazz',
      'Clásica',
      'Hip hop',
      'Reggaetón',
      'Metal',
      'Folk',
      'Teatro',
      'Humor',
      'Familiar',
    ].map((label) => ({ value: label.toLowerCase(), label })),
  },
};

/** Los estados de una pestaña: elegida, sin elegir, con icono y deshabilitada. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6}>
      <Tabs items={ORDERS} accessibilityLabel="Con paneles" />
      <Tabs
        accessibilityLabel="Con iconos y una deshabilitada"
        defaultValue="lugar"
        items={[
          { value: 'fecha', label: 'Fecha', icon: 'calendar' },
          { value: 'lugar', label: 'Lugar', icon: 'map-pin' },
          { value: 'artista', label: 'Artista', icon: 'user', disabled: true },
        ]}
      />
    </Stack>
  ),
};
