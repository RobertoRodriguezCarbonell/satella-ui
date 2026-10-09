/** Lo que una columna dice de su ancho: fijo, o un mínimo a partir del cual crece. */
export interface ColumnSizing {
  width?: number | undefined;
  minWidth?: number | undefined;
}

export interface ColumnWidthsOptions {
  /** Ancho visible para las columnas. Mientras no se conoce, 0. */
  available: number;
  /** Mínimo de una columna que no indica `width` ni `minWidth`. */
  defaultMinWidth: number;
}

/**
 * El ancho de cada columna cuando la plataforma no sabe repartirlo sola, como en React
 * Native, donde cada fila es una vista independiente. Una columna con `width` mide eso;
 * las demás parten de su `minWidth` y se reparten a partes iguales el espacio que sobra.
 * Si no sobra, cada una se queda en su mínimo y la tabla se desplaza.
 */
export function getColumnWidths(
  columns: readonly ColumnSizing[],
  { available, defaultMinWidth }: ColumnWidthsOptions,
): number[] {
  const base = columns.map((column) => column.width ?? column.minWidth ?? defaultMinWidth);
  const flexible = columns.filter((column) => column.width === undefined).length;
  if (flexible === 0) return base;
  const used = base.reduce((total, width) => total + width, 0);
  const share = Math.max(0, available - used) / flexible;
  return columns.map((column, index) => {
    const width = base[index] ?? defaultMinWidth;
    return column.width === undefined ? width + share : width;
  });
}
