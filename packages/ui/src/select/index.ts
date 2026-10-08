export { Select } from './Select';
// Las props propias de la plataforma: `SelectWebProps` en web, `SelectNativeProps` en
// nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './Select';
export type { SelectOption, SelectProps } from './Select.types';
