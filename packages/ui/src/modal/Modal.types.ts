import type { ModalPresentation, ModalProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { ModalProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export interface ModalWebProps extends ModalProps {
  /** Se aplican al `<dialog>`. */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLDialogElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface ModalNativeProps extends ModalProps {
  /** Se aplica a la superficie del diálogo, no al fondo. */
  style?: StyleProp<ViewStyle> | undefined;
}

/** Props de la implementación interna que comparten `Modal` y `Sheet` (ADR-040). */
export type ModalDialogWebProps = ModalWebProps & { presentation: ModalPresentation };
export type ModalDialogNativeProps = ModalNativeProps & { presentation: ModalPresentation };
