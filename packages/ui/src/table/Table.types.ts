import type { TableProps as TableContract } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type {
  SortDirection,
  TableAlign,
  TableColumn,
  TableSize,
  TableSort,
} from '@satellatickets/core';

/** Contrato de `Table`, genérico en el tipo de la fila. */
export type TableProps<Row> = TableContract<Row>;

/** Extensión solo web del contrato (ADR-009). Se aplican al contenedor de la tabla. */
export type TableWebProps<Row> = TableProps<Row> & {
  className?: string | undefined;
  style?: CSSProperties | undefined;
};

/** Extensión solo nativa del contrato. */
export type TableNativeProps<Row> = TableProps<Row> & {
  style?: StyleProp<ViewStyle> | undefined;
};
