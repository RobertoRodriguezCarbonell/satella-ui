import type { ModalWebProps } from './Modal.types';
import { ModalDialog } from './ModalDialog';

export type { ModalWebProps } from './Modal.types';

/** Un diálogo centrado (ADR-040). */
export function Modal(props: ModalWebProps) {
  return <ModalDialog {...props} presentation="dialog" />;
}
