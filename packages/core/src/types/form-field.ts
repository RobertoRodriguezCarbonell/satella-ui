import type { ReactNode } from 'react';

/**
 * Contrato de `FormField`: la etiqueta, la ayuda y el error de un control, enlazados
 * con él para los lectores de pantalla (ADR-037). Envuelve un `Input`, un `TextArea`
 * o un `Select`.
 */
export interface FormFieldProps {
  /** Etiqueta visible. Es texto porque en nativo hace de nombre accesible del control. */
  label: string;
  /** Ayuda bajo el control: formato esperado, para qué se usa el dato. */
  help?: string | undefined;
  /** Mensaje de error. Si existe, el control se marca como inválido. */
  error?: string | undefined;
  /** Marca la etiqueta como obligatoria y lo comunica al control. */
  required?: boolean | undefined;
  /** Deshabilita el control. */
  disabled?: boolean | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  /** El control. */
  children: ReactNode;
}
