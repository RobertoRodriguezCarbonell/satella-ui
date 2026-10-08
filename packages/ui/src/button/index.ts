export { Button } from './Button';
// Las props propias de la plataforma: `ButtonWebProps` en web, `ButtonNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Button';
export type { ButtonProps } from './Button.types';
