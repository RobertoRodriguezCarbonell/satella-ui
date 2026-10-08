import type { ModalNativeProps } from './Modal.types';
import { ModalDialog } from './ModalDialog';

export type { ModalNativeProps } from './Modal.types';

/** Un diálogo centrado (ADR-040). */
export function Modal(props: ModalNativeProps) {
  return <ModalDialog {...props} presentation="dialog" />;
}
