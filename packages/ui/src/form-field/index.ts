export { FormField } from './FormField';
// Las props propias de la plataforma: `FormFieldWebProps` en web, `FormFieldNativeProps`
// en nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './FormField';
export type { FormFieldProps } from './FormField.types';
