export { TextArea } from './TextArea';
// Las props propias de la plataforma: `TextAreaWebProps` en web, `TextAreaNativeProps`
// en nativo. Cada vista exporta las suyas, así los tipos de una plataforma no arrastran
// los de la otra.
export type * from './TextArea';
export type { TextAreaProps } from './TextArea.types';
