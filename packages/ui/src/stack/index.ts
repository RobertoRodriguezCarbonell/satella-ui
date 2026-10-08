export { Stack } from './Stack';
// Las props propias de la plataforma: `StackWebProps` en web, `StackNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Stack';
export type { StackProps } from './Stack.types';
