import type { ModalNativeProps, ModalWebProps } from '../modal/Modal.types';

export type { SheetProps } from '@satellatickets/core';

/** `Sheet` tiene las mismas props que `Modal` (ADR-040). */
export type SheetWebProps = ModalWebProps;
export type SheetNativeProps = ModalNativeProps;
