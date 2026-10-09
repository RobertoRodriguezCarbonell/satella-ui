import { tableSizes } from '@satellatickets/core';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';

import type { Meta, StoryObj } from '../_storybook/types';
import { Badge } from '../badge';
import { IconButton } from '../icon-button';
import { Link } from '../link';
import { Stack } from '../stack';
import { Text } from '../text';
import { Table } from './Table';
import type { TableColumn, TableSort } from './Table.types';

interface Order {
  id: string;
  buyer: string;
  event: string;
  tickets: number;
  total: number;
  status: 'paid' | 'pending' | 'refunded';
}

const ORDERS: readonly Order[] = [
  { id: '1042', buyer: 'Ana Ruiz', event: 'Noche Satella', tickets: 2, total: 90, status: 'paid' },
  {
    id: '1043',
    buyer: 'Luis Ortega',
    event: 'Festival de Otoño',
    tickets: 4,
    total: 236,
    status: 'pending',
  },
  { id: '1044', buyer: 'Marta Gil', event: 'Noche Satella', tickets: 1, total: 45, status: 'paid' },
  {
    id: '1045',
    buyer: 'Iván Soto',
    event: 'Jazz en la Azotea',
    tickets: 3,
    total: 84,
    status: 'refunded',
  },
  {
    id: '1046',
    buyer: 'Carla Vidal',
    event: 'Festival de Otoño',
    tickets: 2,
    total: 118,
    status: 'paid',
  },
];

const STATUS = {
  paid: { label: 'Pagado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  refunded: { label: 'Devuelto', variant: 'info' },
} as const;

/** Con espacio de no separación, como `Intl.NumberFormat`: el símbolo no salta de línea. */
function euros(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')}\u00a0€`;
}

const COLUMNS: readonly TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true, cell: (order) => `#${order.id}` },
  { key: 'buyer', header: 'Comprador', cell: (order) => order.buyer },
  { key: 'event', header: 'Evento', minWidth: 160, cell: (order) => order.event },
  { key: 'tickets', header: 'Entradas', align: 'end', cell: (order) => order.tickets },
  { key: 'total', header: 'Total', align: 'end', cell: (order) => euros(order.total) },
  {
    key: 'status',
    header: 'Estado',
    cell: (order) => (
      <Badge variant={STATUS[order.status].variant}>{STATUS[order.status].label}</Badge>
    ),
  },
];

const SORTABLE_COLUMNS: readonly TableColumn<Order>[] = COLUMNS.map((column) =>
  column.key === 'id' || column.key === 'tickets' || column.key === 'total'
    ? { ...column, sortable: true }
    : column,
);

/** La app es quien ordena: aquí, en el cliente; en un panel real, el servidor. */
function sortOrders(orders: readonly Order[], sort: TableSort | null): readonly Order[] {
  if (sort === null) return orders;
  const value = (order: Order) =>
    sort.column === 'total' ? order.total : sort.column === 'tickets' ? order.tickets : order.id;
  const sign = sort.direction === 'ascending' ? 1 : -1;
  return [...orders].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    return sign * (left < right ? -1 : left > right ? 1 : 0);
  });
}

const SELECTION = {
  selectable: true,
  selectAllLabel: 'Seleccionar todos los pedidos',
  getRowSelectionLabel: (order: Order) => `Seleccionar el pedido ${order.id}`,
} as const;

const meta = {
  title: 'Datos/Table',
  component: Table<Order>,
  parameters: { maturity: 'experimental' },
  argTypes: {
    size: { control: 'inline-radio', options: tableSizes },
    loading: { control: 'boolean' },
    columns: { control: false },
    rows: { control: false },
  },
  args: {
    columns: COLUMNS,
    rows: ORDERS,
    getRowKey: (order: Order) => order.id,
    accessibilityLabel: 'Pedidos',
    size: 'md',
    onSortChange: fn(),
  },
} satisfies Meta<typeof Table<Order>>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Cada columna tiene su cabecera y la celda marcada con `rowHeader` da nombre a su fila.
 * Si la tabla cabe, no añade ninguna parada de tabulación.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Pedidos' });
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(6);
    // La cabecera y una fila por pedido.
    await expect(within(table).getAllByRole('row')).toHaveLength(6);
    await expect(within(table).getByRole('rowheader', { name: '#1042' })).toBeInTheDocument();
    await expect(within(table).getByRole('cell', { name: 'Ana Ruiz' })).toBeInTheDocument();
    await expect(canvas.queryByRole('region')).toBeNull();
  },
};

/**
 * Una columna `sortable` tiene por cabecera un botón. La tabla no reordena nada: avisa
 * con `onSortChange` y pinta las filas en el orden en que la app se las devuelve.
 */
export const Ordenable: Story = {
  args: { columns: SORTABLE_COLUMNS },
  render: function Ordenable(args) {
    const [sort, setSort] = useState<TableSort | null>(null);
    return (
      <Table
        {...args}
        rows={sortOrders(ORDERS, sort)}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          args.onSortChange?.(next);
        }}
      />
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const header = (name: string) => canvas.getByRole('columnheader', { name });
    const firstOrder = () => canvas.getAllByRole('rowheader')[0];
    await expect(header('Total')).not.toHaveAttribute('aria-sort');
    await expect(firstOrder()).toHaveTextContent('#1042');

    // La primera pulsación ordena de menor a mayor.
    await userEvent.click(canvas.getByRole('button', { name: 'Total' }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith({
      column: 'total',
      direction: 'ascending',
    });
    await expect(header('Total')).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstOrder()).toHaveTextContent('#1044');

    // La segunda, sobre la misma columna, invierte el sentido.
    await userEvent.click(canvas.getByRole('button', { name: 'Total' }));
    await expect(header('Total')).toHaveAttribute('aria-sort', 'descending');
    await expect(firstOrder()).toHaveTextContent('#1043');

    // Otra columna empieza de nuevo en ascendente, y solo una está ordenada.
    await userEvent.click(canvas.getByRole('button', { name: 'Entradas' }));
    await expect(header('Entradas')).toHaveAttribute('aria-sort', 'ascending');
    await expect(header('Total')).not.toHaveAttribute('aria-sort');
    await expect(firstOrder()).toHaveTextContent('#1044');
  },
};

/** `defaultSort` marca la columna por la que llegan ordenados los datos. */
export const OrdenInicial: Story = {
  args: {
    columns: SORTABLE_COLUMNS,
    rows: sortOrders(ORDERS, { column: 'total', direction: 'descending' }),
    defaultSort: { column: 'total', direction: 'descending' },
    sortDirectionLabels: { ascending: 'Ascendente', descending: 'Descendente' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('columnheader', { name: 'Total' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  },
};

/**
 * Con `selectable`, cada fila lleva una casilla y la cabecera otra que marca o desmarca
 * todas las que se ven; si solo lo están algunas, queda en estado intermedio.
 */
export const Seleccionable: Story = {
  args: { ...SELECTION, defaultSelectedKeys: ['1043'], onSelectedKeysChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const all = canvas.getByRole('checkbox', { name: 'Seleccionar todos los pedidos' });
    const row = (id: string) =>
      canvas.getByRole('checkbox', { name: `Seleccionar el pedido ${id}` });
    await expect(row('1043')).toBeChecked();
    await expect(all).toBePartiallyChecked();

    await userEvent.click(row('1042'));
    await expect(args.onSelectedKeysChange).toHaveBeenLastCalledWith(['1043', '1042']);
    await expect(row('1042')).toBeChecked();

    // Marca las que faltan.
    await userEvent.click(all);
    await expect(args.onSelectedKeysChange).toHaveBeenLastCalledWith([
      '1043',
      '1042',
      '1044',
      '1045',
      '1046',
    ]);
    await expect(all).toBeChecked();
    await expect(all).not.toBePartiallyChecked();

    // Con todas marcadas, las desmarca.
    await userEvent.click(all);
    await expect(args.onSelectedKeysChange).toHaveBeenLastCalledWith([]);
    await expect(row('1043')).not.toBeChecked();
  },
};

/** Mientras se piden los datos, las filas son huecos y la tabla se marca como ocupada. */
export const Cargando: Story = {
  args: { rows: [], loading: true },
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Pedidos' });
    await expect(table).toHaveAttribute('aria-busy', 'true');
    // La cabecera y cinco huecos, el valor por defecto de `loadingRowCount`.
    await expect(within(table).getAllByRole('row')).toHaveLength(6);
  },
};

/** Sin filas, la tabla muestra `empty` bajo la cabecera. */
export const Vacia: Story = {
  args: { rows: [], empty: 'Todavía no hay pedidos para este evento.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Todavía no hay pedidos para este evento.')).toBeVisible();
    await expect(canvas.getByRole('table', { name: 'Pedidos' })).not.toHaveAttribute('aria-busy');
  },
};

/** `sm` para listados largos: filas de la altura de un control pequeño. */
export const Compacta: Story = {
  args: { size: 'sm' },
};

/**
 * Una celda puede llevar cualquier componente. La columna de acciones no necesita título
 * a la vista (`headerHidden`), pero los lectores de pantalla lo siguen leyendo. Con
 * `minWidth` y `width` ajustados, las cuatro columnas caben en un móvil.
 */
export const ConAcciones: Story = {
  args: {
    columns: [
      {
        key: 'id',
        header: 'Pedido',
        rowHeader: true,
        minWidth: 96,
        cell: (order) => (
          <Link href={`/pedidos/${order.id}`} onPress={(event) => event.preventDefault()}>
            {`#${order.id}`}
          </Link>
        ),
      },
      { key: 'buyer', header: 'Comprador', minWidth: 120, cell: (order) => order.buyer },
      {
        key: 'total',
        header: 'Total',
        align: 'end',
        minWidth: 96,
        cell: (order) => euros(order.total),
      },
      {
        key: 'actions',
        header: 'Acciones',
        headerHidden: true,
        align: 'end',
        width: 72,
        cell: (order) => (
          <IconButton icon="settings" size="sm" label={`Gestionar el pedido ${order.id}`} />
        ),
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: '#1042' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('button')).toHaveLength(5);
  },
};

/**
 * Si las columnas no caben, la tabla se desplaza en horizontal dentro de su contenedor,
 * que entonces es una región enfocable para poder moverla con el teclado.
 */
export const MuchasColumnas: Story = {
  args: {
    columns: [
      ...COLUMNS,
      { key: 'email', header: 'Correo', minWidth: 240, cell: () => 'compras@ejemplo.com' },
      { key: 'channel', header: 'Canal', minWidth: 160, cell: () => 'Web pública' },
      { key: 'date', header: 'Fecha', minWidth: 200, cell: () => '9 oct 2026, 18:42' },
      { key: 'payment', header: 'Pago', minWidth: 200, cell: () => 'Tarjeta ···· 4242' },
      { key: 'invoice', header: 'Factura', minWidth: 160, cell: () => 'F-2026-0193' },
    ].map((column) => ({ minWidth: 160, ...column })),
  },
  play: async ({ canvas }) => {
    const region = await canvas.findByRole('region', { name: 'Pedidos' });
    await expect(region).toHaveAttribute('tabindex', '0');
  },
};

/** Los dos tamaños y los estados de una tabla: con orden y selección, cargando y vacía. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6}>
      {tableSizes.map((size) => (
        <Stack key={size} gap={2}>
          <Text variant="label" color="secondary">
            {size}
          </Text>
          <Table
            {...SELECTION}
            size={size}
            columns={SORTABLE_COLUMNS}
            rows={ORDERS.slice(0, 3)}
            getRowKey={(order) => order.id}
            accessibilityLabel={`Pedidos, tamaño ${size}`}
            defaultSort={{ column: 'id', direction: 'ascending' }}
            defaultSelectedKeys={['1043']}
          />
        </Stack>
      ))}
      <Stack gap={2}>
        <Text variant="label" color="secondary">
          loading
        </Text>
        <Table
          loading
          loadingRowCount={3}
          columns={COLUMNS}
          rows={[]}
          getRowKey={(order) => order.id}
          accessibilityLabel="Pedidos, cargando"
        />
      </Stack>
      <Stack gap={2}>
        <Text variant="label" color="secondary">
          empty
        </Text>
        <Table
          columns={COLUMNS}
          rows={[]}
          getRowKey={(order) => order.id}
          accessibilityLabel="Pedidos, vacía"
          empty="Todavía no hay pedidos para este evento."
        />
      </Stack>
    </Stack>
  ),
};
