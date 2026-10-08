export { Icon } from './Icon';
// Las props propias de la plataforma: `IconWebProps` en web, `IconNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Icon';
export type { IconName, IconProps } from './Icon.types';
