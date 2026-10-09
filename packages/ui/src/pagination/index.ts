export { Pagination } from './Pagination';
// Las props propias de la plataforma: `PaginationWebProps` en web, `PaginationNativeProps`
// en nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './Pagination';
export type { PaginationProps, PaginationSize } from './Pagination.types';
