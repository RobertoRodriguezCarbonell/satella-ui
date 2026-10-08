import type { ReactNode } from 'react';

/** Contrato de `Checkbox`: una opción que se marca o no, con su etiqueta como `children`. */
export interface CheckboxProps {
  /** Estado controlado por la app. Sin él, guarda su propio estado (ADR-037). */
  checked?: boolean | undefined;
  /** Estado inicial cuando guarda su propio estado. */
  defaultChecked?: boolean | undefined;
  /**
   * Ni marcado ni sin marcar: representa a un grupo donde solo algunas opciones lo
   * están. Es solo visual; al pulsarlo pasa a marcado o sin marcar según `checked`.
   */
  indeterminate?: boolean | undefined;
  /** Se llama con el estado nuevo al pulsarlo. */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** No se puede pulsar ni enfocar. */
  disabled?: boolean | undefined;
  /** El estado no es válido, por ejemplo unas condiciones sin aceptar. */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** Nombre accesible cuando no hay etiqueta visible. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  /** Etiqueta. Pulsarla también marca la casilla. */
  children?: ReactNode;
}
