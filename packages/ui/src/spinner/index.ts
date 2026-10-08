export { Spinner } from './Spinner';
// Las props propias de la plataforma: `SpinnerWebProps` en web, `SpinnerNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Spinner';
export type { SpinnerProps } from './Spinner.types';
