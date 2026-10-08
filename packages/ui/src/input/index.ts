export { Input } from './Input';
// Las props propias de la plataforma: `InputWebProps` en web, `InputNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Input';
export type { InputProps } from './Input.types';
