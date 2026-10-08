export { Sheet } from './Sheet';
// Las props propias de la plataforma: `SheetWebProps` en web, `SheetNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Sheet';
export type { SheetProps } from './Sheet.types';
