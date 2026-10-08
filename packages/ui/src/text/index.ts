export { Text } from './Text';
// Las props propias de la plataforma: `TextWebProps` en web, `TextNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Text';
export type { TextProps } from './Text.types';
