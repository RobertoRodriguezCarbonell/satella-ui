import {
  inputIconSize,
  useControllableState,
  useFormFieldControl,
  type ControlSize,
} from '@satellatickets/core';

import { cx } from '../_internal/cx';
import field from '../_internal/field.module.css';
import { Icon } from '../icon/Icon';
import styles from './Select.module.css';
import type { SelectWebProps } from './Select.types';

export type { SelectWebProps } from './Select.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga
// aquí su clase.
const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} satisfies Record<ControlSize, string | undefined>;

/**
 * Un `<select>` real (ADR-038): el teclado, los lectores de pantalla y el selector del
 * sistema en móvil son los del navegador.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  disabled,
  invalid,
  required,
  accessibilityLabel,
  id,
  name,
  className,
  style,
  testID,
  ref,
}: SelectWebProps) {
  const control = useFormFieldControl({ id, invalid, disabled, required });
  // La cadena vacía es "sin elegir" (ADR-037).
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });

  return (
    <div
      className={cx(
        field.field,
        styles.root,
        sizeClass[size],
        control.invalid && field.invalid,
        control.disabled && field.disabled,
        className,
      )}
      style={style}
    >
      <select
        ref={ref}
        id={control.id}
        className={cx(field.control, styles.select, current === '' && styles.placeholder)}
        name={name}
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        disabled={control.disabled}
        aria-label={accessibilityLabel}
        aria-describedby={control.describedBy}
        aria-invalid={control.invalid ? true : undefined}
        // `aria-required` y no `required`: la librería no valida (ADR-037).
        aria-required={control.required ? true : undefined}
        data-testid={testID}
      >
        {/* "Sin elegir": muestra el placeholder y no aparece en la lista. */}
        <option value="" disabled hidden>
          {placeholder ?? ''}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.chevron} aria-hidden="true">
        <Icon
          name="chevron-down"
          size={inputIconSize[size]}
          color={control.disabled ? 'disabled' : 'muted'}
        />
      </span>
    </div>
  );
}
