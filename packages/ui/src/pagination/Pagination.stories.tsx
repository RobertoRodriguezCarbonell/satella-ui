import { paginationSizes } from '@satellatickets/core';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Stack } from '../stack';
import { Table } from '../table';
import { Text } from '../text';
import { Pagination } from './Pagination';

const meta = {
  title: 'Datos/Pagination',
  component: Pagination,
  parameters: { maturity: 'experimental' },
  argTypes: {
    size: { control: 'inline-radio', options: paginationSizes },
    pageCount: { control: { type: 'number', min: 0 } },
    siblingCount: { control: { type: 'number', min: 0 } },
    disabled: { control: 'boolean' },
  },
  args: {
    pageCount: 12,
    size: 'md',
    accessibilityLabel: 'Páginas de pedidos',
    previousLabel: 'Página anterior',
    nextLabel: 'Página siguiente',
    getPageLabel: (page: number) => `Página ${page}`,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empieza en la primera página. Se avanza con siguiente o eligiendo un número; las
 * páginas que no caben se resumen con un salto.
 */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const page = (number: number) => canvas.getByRole('button', { name: `Página ${number}` });
    await expect(canvas.getByRole('navigation', { name: 'Páginas de pedidos' })).toBeVisible();
    await expect(page(1)).toHaveAttribute('aria-current', 'page');
    // No hay página anterior a la primera.
    await expect(canvas.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Página siguiente' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(page(2)).toHaveAttribute('aria-current', 'page');
    await expect(page(1)).not.toHaveAttribute('aria-current');

    await userEvent.click(page(5));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(5);
    await expect(page(5)).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Página anterior' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(4);
  },
};

/** En la última página no hay siguiente. Pulsar la página actual no avisa de nada. */
export const UltimaPagina: Story = {
  args: { defaultPage: 12 },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Página 12' }));
    await expect(args.onPageChange).not.toHaveBeenCalled();
  },
};

/** Si caben todas las páginas, se muestran todas, sin saltos. */
export const PocasPaginas: Story = {
  args: { pageCount: 5, defaultPage: 3 },
  play: async ({ canvas }) => {
    // Cinco páginas, anterior y siguiente.
    await expect(canvas.getAllByRole('button')).toHaveLength(7);
  },
};

/**
 * En medio de muchas páginas quedan la primera, la última, la actual y sus vecinas.
 * `siblingCount` dice cuántas vecinas se ven a cada lado.
 */
export const MuchasPaginas: Story = {
  args: { pageCount: 48, defaultPage: 24, siblingCount: 2 },
  play: async ({ canvas }) => {
    for (const number of [1, 22, 23, 24, 25, 26, 48]) {
      await expect(canvas.getByRole('button', { name: `Página ${number}` })).toBeInTheDocument();
    }
    await expect(canvas.queryByRole('button', { name: 'Página 2' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Página 27' })).toBeNull();
  },
};

/** `sm` acompaña a una tabla compacta y cabe mejor en un móvil. */
export const Compacta: Story = {
  args: { size: 'sm', defaultPage: 6 },
};

/** Deshabilitada entera, por ejemplo mientras llega la página que se ha pedido. */
export const Deshabilitada: Story = {
  args: { disabled: true, defaultPage: 6 },
  play: async ({ args, canvas, userEvent }) => {
    for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Página 7' }));
    await expect(args.onPageChange).not.toHaveBeenCalled();
  },
};

/** Con una sola página, o sin ninguna, no hay adónde ir. */
export const UnaPagina: Story = {
  args: { pageCount: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

interface Attendee {
  id: string;
  name: string;
  ticket: string;
}

const ATTENDEES: readonly Attendee[] = [
  'Ana Ruiz',
  'Luis Ortega',
  'Marta Gil',
  'Iván Soto',
  'Carla Vidal',
  'Pau Ferrer',
  'Noa Blanco',
  'Hugo Marín',
].map((name, index) => ({
  id: String(index + 1),
  name,
  ticket: index % 3 === 0 ? 'Pista' : 'Grada',
}));

const PAGE_SIZE = 3;

/**
 * Con una `Table`: la app guarda la página, pide (aquí, recorta) las filas que tocan y
 * se las pasa a la tabla. Ninguno de los dos sabe nada del otro.
 */
export const ConTabla: Story = {
  args: { pageCount: Math.ceil(ATTENDEES.length / PAGE_SIZE), size: 'sm' },
  render: function ConTabla(args) {
    const [page, setPage] = useState(1);
    const rows = ATTENDEES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return (
      <Stack gap={3}>
        <Table
          size="sm"
          accessibilityLabel="Asistentes"
          columns={[
            { key: 'name', header: 'Asistente', rowHeader: true, cell: (row) => row.name },
            { key: 'ticket', header: 'Entrada', cell: (row) => row.ticket },
          ]}
          rows={rows}
          getRowKey={(row) => row.id}
        />
        <Stack direction="row" align="center" justify="between" gap={3} wrap>
          <Text variant="bodySmall" color="secondary">
            {`${ATTENDEES.length} asistentes`}
          </Text>
          <Pagination
            {...args}
            page={page}
            onPageChange={(next) => {
              setPage(next);
              args.onPageChange?.(next);
            }}
          />
        </Stack>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('rowheader', { name: 'Ana Ruiz' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Página siguiente' }));
    await expect(canvas.queryByRole('rowheader', { name: 'Ana Ruiz' })).toBeNull();
    await expect(canvas.getByRole('rowheader', { name: 'Iván Soto' })).toBeInTheDocument();
    // La última página trae menos filas.
    await userEvent.click(canvas.getByRole('button', { name: 'Página 3' }));
    await expect(canvas.getAllByRole('rowheader')).toHaveLength(2);
  },
};

/** Los dos tamaños, con la página actual al principio, en medio y al final, y deshabilitada. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={6}>
      {paginationSizes.map((size) => (
        <Stack key={size} gap={2}>
          <Text variant="label" color="secondary">
            {size}
          </Text>
          {[1, 6, 12].map((page) => (
            <Pagination
              key={page}
              {...args}
              size={size}
              page={page}
              accessibilityLabel={`Páginas, tamaño ${size}, en la ${page}`}
            />
          ))}
        </Stack>
      ))}
      <Stack gap={2}>
        <Text variant="label" color="secondary">
          disabled
        </Text>
        <Pagination {...args} disabled page={6} accessibilityLabel="Páginas, deshabilitada" />
      </Stack>
    </Stack>
  ),
};
