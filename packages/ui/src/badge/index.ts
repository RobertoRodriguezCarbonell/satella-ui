export { Badge } from './Badge';
// Las props propias de la plataforma: `BadgeWebProps` en web, `BadgeNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Badge';
export type { BadgeProps } from './Badge.types';
