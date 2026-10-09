import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text as RNText } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Table } from './Table';
import * as stories from './Table.stories';

// Las historias son la especificación compartida con web (ADR-017): se comprueban las
// mismas interacciones que sus funciones `play`.
const {
  Default,
  Ordenable,
  OrdenInicial,
  Seleccionable,
  Cargando,
  Vacia,
  Compacta,
  ConAcciones,
  MuchasColumnas,
} = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onSortChange = stories.default.args.onSortChange;
// El de la selección es de una sola historia: aquí se le pasa uno propio.
const onSelectedKeysChange = jest.fn();

type Styled = { props: { style?: unknown } } | null;

function styleOf(element: Styled) {
  return (StyleSheet.flatten(element?.props.style as never) ?? {}) as Record<string, unknown>;
}

/** El número de pedido de cada fila, en el orden en que se pintan. */
function orderIds() {
  return screen.getAllByLabelText(/^Pedido, /).map((cell) => cell.props.children as string);
}

describe('Table (nativo)', () => {
  beforeEach(() => {
    onSortChange.mockClear();
    onSelectedKeysChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('pinta una cabecera por columna y una fila por pedido', async () => {
      await renderWithProvider(<Default />);

      for (const header of ['Pedido', 'Comprador', 'Evento', 'Entradas', 'Total', 'Estado']) {
        expect(screen.getByText(header)).toBeOnTheScreen();
      }
      expect(orderIds()).toEqual(['#1042', '#1043', '#1044', '#1045', '#1046']);
      expect(screen.getByText('Ana Ruiz')).toBeOnTheScreen();
      // Lo que no es texto se pinta tal cual.
      expect(screen.getAllByText('Pagado')).toHaveLength(3);
    });

    it('una cabecera ordenable avisa del orden que se pide y no reordena por su cuenta', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Ordenable />);
      const total = () => screen.getByRole('button', { name: 'Total' });
      expect(total()).not.toBeSelected();
      expect(orderIds()[0]).toBe('#1042');

      // La primera pulsación ordena de menor a mayor.
      await user.press(total());
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'total', direction: 'ascending' });
      expect(total()).toBeSelected();
      expect(orderIds()[0]).toBe('#1044');

      // La segunda, sobre la misma columna, invierte el sentido.
      await user.press(total());
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'total', direction: 'descending' });
      expect(orderIds()[0]).toBe('#1043');

      // Otra columna empieza de nuevo en ascendente, y solo una está ordenada.
      await user.press(screen.getByRole('button', { name: 'Entradas' }));
      expect(onSortChange).toHaveBeenLastCalledWith({ column: 'tickets', direction: 'ascending' });
      expect(screen.getByRole('button', { name: 'Entradas' })).toBeSelected();
      expect(total()).not.toBeSelected();
    });

    it('sin que la app cambie las filas, ordenar solo mueve el indicador', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<OrdenInicial />);
      const before = orderIds();

      await user.press(screen.getByRole('button', { name: 'Pedido' }));

      expect(screen.getByRole('button', { name: 'Pedido' })).toBeSelected();
      expect(orderIds()).toEqual(before);
    });

    it('la casilla de una fila la marca y avisa con todas las claves elegidas', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Seleccionable onSelectedKeysChange={onSelectedKeysChange} />);
      const row = (id: string) =>
        screen.getByRole('checkbox', { name: `Seleccionar el pedido ${id}` });
      expect(row('1043')).toBeChecked();
      expect(row('1042')).not.toBeChecked();

      await user.press(row('1042'));

      expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['1043', '1042']);
      expect(row('1042')).toBeChecked();
    });

    it('la casilla de la cabecera marca las que faltan y, con todas marcadas, las desmarca', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Seleccionable onSelectedKeysChange={onSelectedKeysChange} />);
      const all = () => screen.getByRole('checkbox', { name: 'Seleccionar todos los pedidos' });
      // Solo algunas: estado intermedio.
      expect(all()).toBePartiallyChecked();

      await user.press(all());
      expect(onSelectedKeysChange).toHaveBeenLastCalledWith([
        '1043',
        '1042',
        '1044',
        '1045',
        '1046',
      ]);
      expect(all()).toBeChecked();

      await user.press(all());
      expect(onSelectedKeysChange).toHaveBeenLastCalledWith([]);
      expect(all()).not.toBeChecked();
    });

    it('cargando, las filas son huecos y la tabla se marca como ocupada', async () => {
      await renderWithProvider(<Cargando testID="pedidos" />);

      expect(screen.getByLabelText('Pedidos').props.accessibilityState).toMatchObject({
        busy: true,
      });
      expect(screen.queryAllByLabelText(/^Pedido, /)).toHaveLength(0);
      // La cabecera sigue ahí.
      expect(screen.getByText('Comprador')).toBeOnTheScreen();
    });

    it('cargando con filas, hay tantos huecos como filas había y no se pueden marcar todas', async () => {
      await renderWithProvider(<Seleccionable loading />);

      expect(screen.queryAllByLabelText(/^Pedido, /)).toHaveLength(0);
      expect(screen.queryByRole('checkbox', { name: 'Seleccionar el pedido 1042' })).toBeNull();
      expect(
        screen.getByRole('checkbox', { name: 'Seleccionar todos los pedidos' }),
      ).toBeDisabled();
    });

    it('sin filas muestra el contenido de empty', async () => {
      await renderWithProvider(<Vacia />);

      expect(screen.getByText('Todavía no hay pedidos para este evento.')).toBeOnTheScreen();
      expect(screen.getByLabelText('Pedidos').props.accessibilityState).toMatchObject({
        busy: false,
      });
    });

    it('una celda puede llevar cualquier componente', async () => {
      await renderWithProvider(<ConAcciones />);

      expect(screen.getByRole('link', { name: '#1042' })).toBeOnTheScreen();
      expect(screen.getAllByRole('button')).toHaveLength(5);
      expect(screen.getByRole('button', { name: 'Gestionar el pedido 1042' })).toBeOnTheScreen();
    });
  });

  describe('accesibilidad', () => {
    it('la tabla tiene nombre y no agrupa sus celdas en un solo elemento', async () => {
      await renderWithProvider(<Default />);

      const table = screen.getByLabelText('Pedidos');
      expect(table.props.role).toBe('table');
      expect(table.props.accessible).not.toBe(true);
    });

    it('cada celda de texto dice a qué columna pertenece', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByLabelText('Comprador, Ana Ruiz')).toHaveTextContent('Ana Ruiz');
      expect(screen.getByLabelText('Total, 90,00\u00a0€')).toBeOnTheScreen();
      // También los números: dos pedidos tienen dos entradas.
      expect(screen.getAllByLabelText('Entradas, 2')).toHaveLength(2);
    });

    it('la cabecera ordenada dice su sentido con los textos de la app', async () => {
      await renderWithProvider(<OrdenInicial />);

      const total = screen.getByRole('button', { name: 'Total' });
      expect(total).toBeSelected();
      expect(total.props.accessibilityValue).toEqual({ text: 'Descendente' });
      // La que no está ordenada no dice nada.
      const pedido = screen.getByRole('button', { name: 'Pedido' });
      expect((pedido.props.accessibilityValue as { text?: string }).text).toBeUndefined();
    });

    it('una cabecera oculta no se pinta: su nombre lo llevan las celdas', async () => {
      await renderWithProvider(<ConAcciones />);

      expect(screen.queryByText('Acciones')).toBeNull();
      expect(screen.getByText('Comprador')).toBeOnTheScreen();
    });

    it('los iconos de ordenación son decorativos', async () => {
      await renderWithProvider(<Ordenable />);

      expect(screen.queryByRole('image')).toBeNull();
    });
  });

  describe('aspecto', () => {
    // Lo que mide la tabla en pantalla, que es lo que tiene para repartir entre sus columnas.
    const layout = (testID: string, width: number) =>
      fireEvent(screen.getByTestId(testID), 'layout', {
        nativeEvent: { layout: { x: 0, y: 0, width, height: 300 } },
      });
    const widthOf = (element: Styled) => styleOf(element).width;

    it('hasta que se mide, cada columna ocupa su mínimo', async () => {
      await renderWithProvider(<Default testID="pedidos" />);

      // `minWidth` de la columna, o 128 si no lo indica.
      expect(widthOf(screen.getByText('Evento').parent)).toBe(160);
      expect(widthOf(screen.getByText('Comprador').parent)).toBe(128);
    });

    it('cada columna mide lo mismo en la cabecera y en todas las filas', async () => {
      await renderWithProvider(<Default testID="pedidos" />);
      // Seis columnas que piden 800 en una tabla de 922 con su borde: sobran 120, 20 por columna.
      await layout('pedidos', 922);

      expect(widthOf(screen.getByText('Evento').parent)).toBe(180);
      for (const cell of screen.getAllByLabelText(/^Evento, /)) {
        expect(styleOf(cell.parent)).toMatchObject({ width: 180, flexGrow: 0, flexShrink: 0 });
      }
      expect(widthOf(screen.getByText('Comprador').parent)).toBe(148);
      for (const cell of screen.getAllByLabelText(/^Comprador, /)) {
        expect(widthOf(cell.parent)).toBe(148);
      }
    });

    it('una columna con width no crece: lo que sobra es para las demás', async () => {
      await renderWithProvider(<ConAcciones testID="pedidos" />);
      // Columnas de 96, 120 y 96 y la de acciones, de 72: piden 384 de 626. Sobran 240.
      await layout('pedidos', 626);

      const actions = screen.getByRole('button', { name: 'Gestionar el pedido 1042' }).parent;
      expect(widthOf(actions)).toBe(72);
      expect(widthOf(screen.getByText('Comprador').parent)).toBe(200);
    });

    it('si las columnas no caben, se quedan en su mínimo y la rejilla se desplaza', async () => {
      await renderWithProvider(<MuchasColumnas testID="pedidos" />);
      await layout('pedidos', 393);

      const grid = screen.getByText('Pedido').parent?.parent?.parent ?? null;
      // Once columnas: ocho de 160, dos de 200 y la del correo, de 240.
      expect(styleOf(grid)).toMatchObject({ width: 8 * 160 + 2 * 200 + 240, minWidth: 391 });
      expect(widthOf(screen.getByText('Correo').parent)).toBe(240);
    });

    it('la columna de casillas no cuenta en el reparto', async () => {
      await renderWithProvider(<Seleccionable testID="pedidos" />);
      // La casilla (20) y su relleno (16) ocupan 36; quedan 884 para columnas que piden 800.
      await layout('pedidos', 922);

      const box = screen.getByRole('checkbox', { name: 'Seleccionar el pedido 1042' }).parent;
      expect(widthOf(box)).toBe(36);
      expect(widthOf(screen.getByText('Evento').parent)).toBe(174);
    });

    it('una cabecera ordenable mide lo mismo que las celdas de su columna', async () => {
      await renderWithProvider(<Ordenable testID="pedidos" />);
      await layout('pedidos', 922);

      const header = screen.getByRole('button', { name: 'Total' });
      expect(styleOf(header)).toMatchObject({ width: 148, flexGrow: 0, flexShrink: 0 });
      expect(widthOf(screen.getByLabelText('Total, 90,00\u00a0€').parent)).toBe(148);
    });

    it('la columna alineada al final alinea su cabecera y sus celdas', async () => {
      await renderWithProvider(<Default />);

      expect(styleOf(screen.getByText('Total'))).toMatchObject({ textAlign: 'right' });
      expect(styleOf(screen.getByLabelText('Total, 90,00\u00a0€'))).toMatchObject({
        textAlign: 'right',
      });
      expect(styleOf(screen.getByLabelText('Total, 90,00\u00a0€').parent)).toMatchObject({
        alignItems: 'flex-end',
      });
    });

    it('en una cabecera ordenable alineada al final el icono va delante del texto', async () => {
      await renderWithProvider(<Ordenable />);

      expect(styleOf(screen.getByRole('button', { name: 'Total' }))).toMatchObject({
        flexDirection: 'row-reverse',
      });
      expect(styleOf(screen.getByRole('button', { name: 'Pedido' }))).toMatchObject({
        flexDirection: 'row',
      });
    });

    it.each([
      ['md', Default, themes.dark.size.control.md],
      ['sm', Compacta, themes.dark.size.control.sm],
    ] as const)(
      'las filas %s miden como mínimo lo que un control de ese tamaño',
      async (_size, Story, height) => {
        await renderWithProvider(<Story />);

        expect(styleOf(screen.getByLabelText('Comprador, Ana Ruiz').parent).minHeight).toBe(height);
        expect(styleOf(screen.getByText('Comprador').parent).minHeight).toBe(height);
      },
    );

    it('la cabecera usa la tipografía de etiqueta y la fila elegida se tiñe', async () => {
      await renderWithProvider(<Seleccionable />, { theme: 'dark' });

      expect(styleOf(screen.getByText('Comprador'))).toMatchObject({
        textTransform: 'uppercase',
        fontSize: themes.dark.font.size.xs,
        color: themes.dark.color.text.secondary,
      });
      const row = (id: string) => screen.getByLabelText(`Pedido, #${id}`).parent?.parent ?? null;
      expect(styleOf(row('1043')).backgroundColor).toBe(themes.dark.color.accent.bg);
      expect(styleOf(row('1042')).backgroundColor).toBeUndefined();
    });

    it('envuelve en <Text> un empty de texto y deja tal cual otro contenido', async () => {
      await renderWithProvider(
        <Table
          columns={[{ key: 'a', header: 'Uno', cell: () => 'x' }]}
          rows={[]}
          getRowKey={() => 'a'}
          accessibilityLabel="Vacía"
          empty={<RNText testID="propio">Nada por aquí</RNText>}
        />,
      );

      expect(screen.getByTestId('propio')).toBeOnTheScreen();
    });
  });
});
