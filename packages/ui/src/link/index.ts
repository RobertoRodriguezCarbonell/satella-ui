export { Link } from './Link';
// Las props propias de la plataforma: `LinkWebProps` en web, `LinkNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Link';
export type { LinkPressEvent, LinkProps } from './Link.types';
