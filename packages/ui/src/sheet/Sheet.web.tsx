import { ModalDialog } from '../modal/ModalDialog';
import type { SheetWebProps } from './Sheet.types';

export type { SheetWebProps } from './Sheet.types';

/** Un diálogo anclado al borde inferior (ADR-040). Comparte todo con `Modal` salvo dónde se coloca. */
export function Sheet(props: SheetWebProps) {
  return <ModalDialog {...props} presentation="sheet" />;
}
