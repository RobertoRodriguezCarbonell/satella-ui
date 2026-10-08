import type { ReactNode } from 'react';

/**
 * Contrato de `Modal` y de `Sheet` (ADR-040): un diálogo que interrumpe lo que hay
 * debajo. `Modal` se centra; `Sheet` se ancla al borde inferior.
 */
export interface ModalProps {
  /** Si está abierto. Lo decide la app. */
  open: boolean;
  /**
   * El diálogo pide cerrarse: Escape, pulsar fuera, el botón atrás de Android o su
   * botón de cierre. La app responde poniendo `open` a `false`.
   */
  onClose: () => void;
  /** Título visible. Es también su nombre accesible. */
  title: string;
  /** Texto bajo el título. Los lectores de pantalla lo leen al abrirse. */
  description?: string | undefined;
  /**
   * Si existe, muestra un botón de cierre con este nombre accesible ("Cerrar"). La
   * librería no trae textos propios.
   */
  closeLabel?: string | undefined;
  /**
   * Con `false`, ni Escape, ni pulsar fuera, ni el botón atrás lo cierran: es para una
   * pregunta que exige respuesta. Por defecto `true`.
   */
  dismissible?: boolean | undefined;
  /** Acciones al pie, normalmente botones. */
  footer?: ReactNode;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  children?: ReactNode;
}

/** `Sheet` tiene el mismo contrato que `Modal`: solo cambia dónde se coloca. */
export type SheetProps = ModalProps;

/** Las dos presentaciones de un diálogo. */
export const modalPresentations = ['dialog', 'sheet'] as const;
export type ModalPresentation = (typeof modalPresentations)[number];
