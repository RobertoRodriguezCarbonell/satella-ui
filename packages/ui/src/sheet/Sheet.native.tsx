import { ModalDialog } from '../modal/ModalDialog';
import type { SheetNativeProps } from './Sheet.types';

export type { SheetNativeProps } from './Sheet.types';

/** Un diálogo anclado al borde inferior (ADR-040). Comparte todo con `Modal` salvo dónde se coloca. */
export function Sheet(props: SheetNativeProps) {
  return <ModalDialog {...props} presentation="sheet" />;
}
