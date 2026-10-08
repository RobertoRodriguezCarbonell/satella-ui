import type { ControlSize } from './control';

/** Una opción de `Select`. */
export interface SelectOption {
  /** Lo que recibe `onValueChange`. No puede ser una cadena vacía: eso es "sin elegir". */
  value: string;
  /** Lo que se muestra. */
  label: string;
  disabled?: boolean | undefined;
}

/** Contrato de `Select`: elegir una opción de una lista (ADR-038). */
export interface SelectProps {
  options: readonly SelectOption[];
  /** Opción elegida, controlada por la app. Sin ella, guarda su propio estado (ADR-037). */
  value?: string | undefined;
  /** Opción inicial cuando guarda su propio estado. */
  defaultValue?: string | undefined;
  /** Se llama con el `value` de la opción elegida. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Texto que se muestra mientras no hay ninguna opción elegida. */
  placeholder?: string | undefined;
  size?: ControlSize | undefined;
  /** No se puede abrir ni enfocar. */
  disabled?: boolean | undefined;
  /** El valor no es válido. Dentro de un `FormField` con `error` se activa solo. */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** Nombre accesible cuando no hay un `FormField` que lo etiquete. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
