export { Switch } from './Switch';
// Las props propias de la plataforma: `SwitchWebProps` en web, `SwitchNativeProps` en
// nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './Switch';
export type { SwitchProps } from './Switch.types';
