/** Contrato de `TextArea`: un campo de texto de varias líneas. */
export interface TextAreaProps {
  /** Texto controlado por la app. Sin él, el campo guarda su propio estado (ADR-037). */
  value?: string | undefined;
  /** Texto inicial cuando el campo guarda su propio estado. */
  defaultValue?: string | undefined;
  /** Se llama con el texto nuevo en cada cambio. */
  onChangeText?: ((text: string) => void) | undefined;
  placeholder?: string | undefined;
  /** Líneas visibles sin desplazarse (por defecto 3). Fija la altura mínima. */
  rows?: number | undefined;
  /** No se puede editar ni enfocar. */
  disabled?: boolean | undefined;
  /** Se puede enfocar y copiar, pero no editar. */
  readOnly?: boolean | undefined;
  /** El valor no es válido. Dentro de un `FormField` con `error` se activa solo. */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  maxLength?: number | undefined;
  onFocus?: (() => void) | undefined;
  onBlur?: (() => void) | undefined;
  /** Nombre accesible cuando no hay un `FormField` que lo etiquete. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
