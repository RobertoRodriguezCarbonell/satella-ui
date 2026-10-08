export { Modal } from './Modal';
// Las props propias de la plataforma: `ModalWebProps` en web, `ModalNativeProps` en nativo.
// Cada vista exporta las suyas, así los tipos de una plataforma no arrastran los de la otra.
export type * from './Modal';
export type { ModalProps } from './Modal.types';
