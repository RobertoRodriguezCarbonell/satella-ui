export { Table } from './Table';
// Las props propias de la plataforma: `TableWebProps` en web, `TableNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Table';
export type {
  SortDirection,
  TableAlign,
  TableColumn,
  TableProps,
  TableSize,
  TableSort,
} from './Table.types';
