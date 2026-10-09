export { DatePicker } from './DatePicker';
// Las props propias de la plataforma: `DatePickerWebProps` en web, `DatePickerNativeProps`
// en nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './DatePicker';
export type { DatePickerProps } from './DatePicker.types';
