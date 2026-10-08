import { useFormFieldControl } from '@satellatickets/core';

import { cx } from '../_internal/cx';
import field from '../_internal/field.module.css';
import styles from './TextArea.module.css';
import type { TextAreaWebProps } from './TextArea.types';

export type { TextAreaWebProps } from './TextArea.types';

export function TextArea({
  value,
  defaultValue,
  onChangeText,
  placeholder,
  rows = 3,
  disabled,
  readOnly = false,
  invalid,
  required,
  maxLength,
  onFocus,
  onBlur,
  accessibilityLabel,
  id,
  name,
  className,
  style,
  testID,
  ref,
}: TextAreaWebProps) {
  const control = useFormFieldControl({ id, invalid, disabled, required });

  return (
    <textarea
      ref={ref}
      id={control.id}
      className={cx(
        field.field,
        styles.root,
        control.invalid && field.invalid,
        readOnly && field.readOnly,
        control.disabled && field.disabled,
        className,
      )}
      style={style}
      rows={rows}
      name={name}
      // Controlado si la app pasa `value`; si no, el navegador guarda el texto (ADR-037).
      {...(value === undefined ? { defaultValue } : { value })}
      onChange={(event) => onChangeText?.(event.target.value)}
      placeholder={placeholder}
      disabled={control.disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      aria-label={accessibilityLabel}
      aria-describedby={control.describedBy}
      aria-invalid={control.invalid ? true : undefined}
      // `aria-required` y no `required`: la librería no valida (ADR-037).
      aria-required={control.required ? true : undefined}
      data-testid={testID}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
