import { expect, fn, within } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Table } from './Table';
import type { TableColumn } from './Table.types';

interface Event {
  id: string;
  name: string;
  venue: string;
  sold: number;
}

const EVENTS: readonly Event[] = [
  { id: 'noche', name: 'Noche Satella', venue: 'Sala Apolo', sold: 412 },
  { id: 'otono', name: 'Festival de Otoño', venue: 'Parc del Fòrum', sold: 3180 },
  { id: 'jazz', name: 'Jazz en la Azotea', venue: 'Hotel Pulitzer', sold: 96 },
];

const COLUMNS: readonly TableColumn<Event>[] = [
  { key: 'name', header: 'Evento', rowHeader: true, sortable: true, cell: (event) => event.name },
  { key: 'venue', header: 'Recinto', cell: (event) => event.venue },
  {
    key: 'sold',
    header: 'Vendidas',
    align: 'end',
    sortable: true,
    width: 160,
    cell: (event) => event.sold,
  },
];

/**
 * Historias solo web (ADR-012): estados que dependen de pseudo-clases CSS, del teclado y
 * de las medidas del navegador. Las fuerza `storybook-addon-pseudo-states`, así quedan
 * fijas en el catálogo y en las referencias visuales.
 */
const meta = {
  title: 'Datos/Table/Estados web',
  component: Table<Event>,
  parameters: { maturity: 'experimental' },
  args: {
    columns: COLUMNS,
    rows: EVENTS,
    getRowKey: (event: Event) => event.id,
    accessibilityLabel: 'Eventos',
    defaultSort: { column: 'name', direction: 'ascending' },
    selectable: true,
    selectAllLabel: 'Seleccionar todos los eventos',
    getRowSelectionLabel: (event: Event) => `Seleccionar ${event.name}`,
    defaultSelectedKeys: ['otono'],
    onSortChange: fn(),
    onSelectedKeysChange: fn(),
  },
} satisfies Meta<typeof Table<Event>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Solo reaccionan las cabeceras ordenables y las casillas: una fila no se pulsa. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Pulsado: Story = {
  parameters: { pseudo: { active: true } },
};

/** El anillo de foco de una cabecera se dibuja hacia dentro: la tabla recorta sus bordes. */
export const Foco: Story = {
  parameters: { pseudo: { focusVisible: true } },
};

/**
 * El orden de tabulación es el de lectura: la casilla de la cabecera, las cabeceras
 * ordenables y la casilla de cada fila. Intro y Espacio ordenan; Espacio marca una casilla.
 */
export const Teclado: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole('checkbox', { name: 'Seleccionar todos los eventos' }),
    ).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Evento' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSortChange).toHaveBeenLastCalledWith({
      column: 'name',
      direction: 'descending',
    });

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Vendidas' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onSortChange).toHaveBeenLastCalledWith({
      column: 'sold',
      direction: 'ascending',
    });
    await expect(canvas.getByRole('columnheader', { name: 'Vendidas' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );

    await userEvent.tab();
    const first = canvas.getByRole('checkbox', { name: 'Seleccionar Noche Satella' });
    await expect(first).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(first).toBeChecked();
    await expect(args.onSelectedKeysChange).toHaveBeenLastCalledWith(['otono', 'noche']);
  },
};

/**
 * Los lectores de pantalla leen la cabecera de la columna y la de la fila al moverse por
 * las celdas: las primeras son `<th scope="col">` y la celda `rowHeader`, `<th scope="row">`.
 * La columna de casillas no tiene título, así que su celda de cabecera no es un `<th>`.
 */
export const Semantica: Story = {
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Eventos' });
    const headers = within(table).getAllByRole('columnheader');
    await expect(headers).toHaveLength(3);
    for (const header of headers) await expect(header).toHaveAttribute('scope', 'col');

    const rowHeader = within(table).getByRole('rowheader', { name: 'Noche Satella' });
    await expect(rowHeader.tagName).toBe('TH');
    await expect(rowHeader).toHaveAttribute('scope', 'row');
    // Una fila se nombra por su cabecera.
    await expect(within(table).getByRole('row', { name: /Noche Satella/ })).toBeInTheDocument();
  },
};

/**
 * `width` fija el ancho de una columna; las demás se reparten el resto según su
 * contenido. La alineación de la columna se aplica a la cabecera y a sus celdas.
 */
export const Anchos: Story = {
  play: async ({ canvas }) => {
    const header = canvas.getByRole('columnheader', { name: 'Vendidas' });
    await expect(header.getBoundingClientRect().width).toBeCloseTo(160, 0);
    await expect(getComputedStyle(header).textAlign).toBe('end');
    await expect(getComputedStyle(canvas.getByRole('cell', { name: '412' })).textAlign).toBe('end');
  },
};

/**
 * Cuando la tabla no cabe, su contenedor se desplaza y pasa a ser una parada de
 * tabulación con el nombre de la tabla, para moverlo con las flechas.
 */
export const Desplazamiento: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Evento', rowHeader: true, minWidth: 320, cell: (e) => e.name },
      { key: 'venue', header: 'Recinto', minWidth: 320, cell: (e) => e.venue },
      { key: 'city', header: 'Ciudad', minWidth: 320, cell: () => 'Barcelona' },
      { key: 'date', header: 'Fecha', minWidth: 320, cell: () => '9 oct 2026' },
      { key: 'sold', header: 'Vendidas', align: 'end', minWidth: 320, cell: (e) => e.sold },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const region = await canvas.findByRole('region', { name: 'Eventos' });
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    // Es lo primero que encuentra el tabulador; después, lo que hay dentro.
    await userEvent.tab();
    await expect(region).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvas.getByRole('checkbox', { name: 'Seleccionar todos los eventos' }),
    ).toHaveFocus();
  },
};
