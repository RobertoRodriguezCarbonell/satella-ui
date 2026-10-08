export { Card } from './Card';
// Las props propias de la plataforma: `CardWebProps` en web, `CardNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Card';
export type { CardProps } from './Card.types';
