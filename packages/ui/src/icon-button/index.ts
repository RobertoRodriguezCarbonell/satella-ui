export { IconButton } from './IconButton';
// Las props propias de la plataforma: `IconButtonWebProps` en web, `IconButtonNativeProps`
// en nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './IconButton';
export type { IconButtonProps } from './IconButton.types';
