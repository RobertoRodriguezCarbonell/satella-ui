import { useEffect, useMemo, useRef } from 'react';

import { cx } from '../_internal/cx';
import { mergeRefs } from '../_internal/mergeRefs';
import { Icon } from '../icon/Icon';
import styles from './Checkbox.module.css';
import type { CheckboxWebProps } from './Checkbox.types';

export type { CheckboxWebProps } from './Checkbox.types';

export function Checkbox({
  checked,
  defaultChecked,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  invalid = false,
  required = false,
  accessibilityLabel,
  id,
  name,
  value,
  className,
  style,
  testID,
  ref,
  children,
}: CheckboxWebProps) {
  const input = useRef<HTMLInputElement>(null);
  const setRef = useMemo(() => mergeRefs(input, ref), [ref]);

  // `indeterminate` solo existe como propiedad del DOM, no como atributo.
  useEffect(() => {
    if (input.current !== null) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cx(styles.root, disabled && styles.disabled, className)} style={style}>
      <input
        ref={setRef}
        type="checkbox"
        className={styles.input}
        id={id}
        name={name}
        value={value}
        // Controlada si la app pasa `checked`; si no, el navegador guarda el estado (ADR-037).
        {...(checked === undefined ? { defaultChecked } : { checked })}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        disabled={disabled}
        aria-label={accessibilityLabel}
        aria-invalid={invalid ? true : undefined}
        // `aria-required` y no `required`: la librería no valida (ADR-037).
        aria-required={required ? true : undefined}
        data-testid={testID}
      />
      <span className={cx(styles.box, invalid && styles.invalid)} aria-hidden="true">
        <Icon name="check" size="sm" color="onPrimary" className={cx(styles.mark, styles.check)} />
        <Icon name="minus" size="sm" color="onPrimary" className={cx(styles.mark, styles.dash)} />
      </span>
      {children === undefined || children === null ? null : (
        <span className={styles.label}>{children}</span>
      )}
    </label>
  );
}
