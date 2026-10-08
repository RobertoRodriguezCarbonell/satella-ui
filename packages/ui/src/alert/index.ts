export { Alert } from './Alert';
// Las props propias de la plataforma: `AlertWebProps` en web, `AlertNativeProps` en
// nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './Alert';
export type { AlertProps } from './Alert.types';
