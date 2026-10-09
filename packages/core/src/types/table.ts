import type { ReactNode } from 'react';

/**
 * Densidades de `Table` (ADR-009). Las filas miden como mínimo lo que un control de
 * ese tamaño (`size.control`): `sm` para listados largos, `md` por defecto.
 */
export const tableSizes = ['sm', 'md'] as const;
export type TableSize = (typeof tableSizes)[number];

/** Alineación del contenido de una columna, cabecera incluida. Los números, a `end`. */
export const tableAligns = ['start', 'center', 'end'] as const;
export type TableAlign = (typeof tableAligns)[number];

export const sortDirections = ['ascending', 'descending'] as const;
export type SortDirection = (typeof sortDirections)[number];

/** Por qué columna están ordenadas las filas y en qué sentido. */
export interface TableSort {
  /** El `key` de la columna. */
  column: string;
  direction: SortDirection;
}

/** Una columna de `Table`. */
export interface TableColumn<Row> {
  /** Identifica la columna. Es lo que viaja en `sort`. */
  key: string;
  /** Texto de la cabecera. También da nombre a las celdas para los lectores de pantalla. */
  header: string;
  /**
   * Contenido de la celda de una fila. Si es texto o un número, la tabla le da su
   * tipografía; cualquier otro contenido (`Badge`, `Link`, `IconButton`…) se pinta tal cual.
   */
  cell: (row: Row) => ReactNode;
  /** Por defecto `start`. */
  align?: TableAlign | undefined;
  /**
   * Ancho fijo, en puntos, con el relleno de la celda incluido. Sin él, la columna se
   * reparte el espacio con las demás: en web según su contenido, en nativo a partes
   * iguales a partir de `minWidth` (128 si no se indica).
   */
  width?: number | undefined;
  /**
   * Ancho mínimo, en puntos y con el relleno incluido, de una columna sin `width`. Si el
   * contenido no cabe en el ancho de su columna, sigue en la línea siguiente.
   */
  minWidth?: number | undefined;
  /** La cabecera es un botón que pide ordenar por esta columna (`onSortChange`). */
  sortable?: boolean | undefined;
  /**
   * La cabecera no se ve, pero se sigue anunciando: para una columna de acciones, que
   * no necesita título a la vista.
   */
  headerHidden?: boolean | undefined;
  /**
   * La celda identifica a la fila (el número de pedido, el nombre del evento). En web
   * es su cabecera (`<th scope="row">`) y los lectores de pantalla la leen al cambiar de fila.
   */
  rowHeader?: boolean | undefined;
}

interface TableBaseProps<Row> {
  columns: readonly TableColumn<Row>[];
  /** Las filas, ya en el orden y la página en que deben verse: `Table` no ordena ni pagina. */
  rows: readonly Row[];
  /** Clave única y estable de una fila. Es la que guarda `selectedKeys`. */
  getRowKey: (row: Row) => string;
  /** Nombre accesible de la tabla ("Pedidos"). */
  accessibilityLabel: string;
  size?: TableSize | undefined;
  /**
   * Columna ordenada, controlada por la app; `null` es ninguna. Sin ella, la tabla
   * guarda su propio estado (ADR-037).
   */
  sort?: TableSort | null | undefined;
  /** Orden inicial cuando guarda su propio estado. */
  defaultSort?: TableSort | null | undefined;
  /**
   * Se llama con el orden que se pide al pulsar una cabecera ordenable: ascendente la
   * primera vez, y el contrario en cada pulsación sobre la misma columna.
   */
  onSortChange?: ((sort: TableSort) => void) | undefined;
  /**
   * Lo que el lector de pantalla dice del sentido de la columna ordenada
   * (`{ ascending: 'Ascendente', descending: 'Descendente' }`). Lo usa la vista nativa;
   * en web el navegador ya lo comunica.
   */
  sortDirectionLabels?: Readonly<Record<SortDirection, string>> | undefined;
  /** Los datos se están pidiendo: las filas se sustituyen por huecos. */
  loading?: boolean | undefined;
  /** Con `loading` y sin filas: cuántos huecos se pintan (por defecto 5). */
  loadingRowCount?: number | undefined;
  /** Lo que se muestra cuando no hay filas ni se están cargando. */
  empty?: ReactNode;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}

interface TablePlainProps<Row> extends TableBaseProps<Row> {
  selectable?: false | undefined;
  selectedKeys?: undefined;
  defaultSelectedKeys?: undefined;
  onSelectedKeysChange?: undefined;
  selectAllLabel?: undefined;
  getRowSelectionLabel?: undefined;
}

interface TableSelectableProps<Row> extends TableBaseProps<Row> {
  /** Cada fila lleva una casilla, y la cabecera otra que marca todas las que se ven. */
  selectable: true;
  /** Claves de las filas elegidas, controladas por la app. Sin ellas, la tabla guarda su estado. */
  selectedKeys?: readonly string[] | undefined;
  /** Filas elegidas al empezar cuando guarda su propio estado. */
  defaultSelectedKeys?: readonly string[] | undefined;
  /**
   * Se llama con todas las claves elegidas. Puede incluir claves de filas que ahora no
   * se ven: la selección sobrevive al cambiar de página.
   */
  onSelectedKeysChange?: ((keys: readonly string[]) => void) | undefined;
  /**
   * Nombre accesible de la casilla de la cabecera ("Seleccionar todos los pedidos").
   * Es obligatorio con `selectable`: la librería no trae textos propios.
   */
  selectAllLabel: string;
  /** Nombre accesible de la casilla de una fila ("Seleccionar el pedido 1042"). */
  getRowSelectionLabel: (row: Row) => string;
}

/**
 * Contrato de `Table`: filas de datos con las mismas columnas, para comparar valores y
 * actuar sobre ellos (ADR-045). Es genérica en el tipo de la fila.
 */
export type TableProps<Row> = TablePlainProps<Row> | TableSelectableProps<Row>;
