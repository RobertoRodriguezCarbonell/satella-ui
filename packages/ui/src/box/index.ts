export { Box } from './Box';
// Las props propias de la plataforma: `BoxWebProps` en web, `BoxNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Box';
export type { BoxProps } from './Box.types';
