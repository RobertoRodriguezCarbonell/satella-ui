import { createContext, useContext } from 'react';

/** Lo que `FormField` publica para el control que envuelve (ADR-037). */
export interface FormFieldValue {
  /** `id` del control. `FormField` lo usa en el `htmlFor` de su etiqueta (web). */
  controlId: string;
  /** `id` del texto de ayuda, si lo hay (web). */
  helpId: string | undefined;
  /** `id` del mensaje de error, si lo hay (web). */
  errorId: string | undefined;
  label: string;
  help: string | undefined;
  error: string | undefined;
  disabled: boolean;
  required: boolean;
}

export interface FormFieldValueOptions {
  label: string;
  help?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
}

/** Un texto vacío cuenta como ausente: `error={errores.email}` suele llegar así. */
function present(text: string | undefined): string | undefined {
  return text === undefined || text === '' ? undefined : text;
}

/** Construye el valor del contexto a partir de un id base (el de `useId()`). */
export function createFormFieldValue(
  baseId: string,
  { label, help, error, disabled = false, required = false }: FormFieldValueOptions,
): FormFieldValue {
  const helpText = present(help);
  const errorText = present(error);
  return {
    controlId: `${baseId}-control`,
    helpId: helpText === undefined ? undefined : `${baseId}-help`,
    errorId: errorText === undefined ? undefined : `${baseId}-error`,
    label,
    help: helpText,
    error: errorText,
    disabled,
    required,
  };
}

/** `null` fuera de un `FormField`. */
export const FormFieldContext = createContext<FormFieldValue | null>(null);

/** Las props propias de un control que se combinan con las de su `FormField`. */
export interface FormFieldControlOptions {
  id?: string | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  accessibilityLabel?: string | undefined;
}

/** Lo que un control necesita para enlazarse con su `FormField`, en web y en nativo. */
export interface FormFieldControl {
  /** `id` del control (web): el propio o el que espera la etiqueta del campo. */
  id: string | undefined;
  /** Ids de la ayuda y el error para `aria-describedby` (web). */
  describedBy: string | undefined;
  /** Nombre accesible (nativo): el propio o la etiqueta del campo. */
  accessibilityLabel: string | undefined;
  /** El error y la ayuda, uno tras otro, para `accessibilityHint` (nativo). */
  accessibilityHint: string | undefined;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
}

/**
 * Combina las props de un control con las de su `FormField`. Las del control
 * mandan en `id` y nombre accesible; `invalid`, `disabled` y `required` se suman:
 * basta con que lo diga uno de los dos.
 */
export function resolveFormFieldControl(
  field: FormFieldValue | null,
  {
    id,
    invalid = false,
    disabled = false,
    required = false,
    accessibilityLabel,
  }: FormFieldControlOptions = {},
): FormFieldControl {
  if (field === null) {
    return {
      id,
      describedBy: undefined,
      accessibilityLabel,
      accessibilityHint: undefined,
      invalid,
      disabled,
      required,
    };
  }
  const describedBy = [field.helpId, field.errorId].filter((part) => part !== undefined).join(' ');
  const hint = [field.error, field.help].filter((part) => part !== undefined).join(' ');
  return {
    id: id ?? field.controlId,
    describedBy: describedBy === '' ? undefined : describedBy,
    accessibilityLabel: accessibilityLabel ?? field.label,
    accessibilityHint: hint === '' ? undefined : hint,
    invalid: invalid || field.error !== undefined,
    disabled: disabled || field.disabled,
    required: required || field.required,
  };
}

/** Enlaza un control con el `FormField` que lo contiene, si lo hay. */
export function useFormFieldControl(options?: FormFieldControlOptions): FormFieldControl {
  return resolveFormFieldControl(useContext(FormFieldContext), options);
}
