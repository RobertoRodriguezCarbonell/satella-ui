import { createFormFieldValue, FormFieldContext } from '@satellatickets/core';
import { useId, useMemo } from 'react';

import { cx } from '../_internal/cx';
import { Icon } from '../icon/Icon';
import styles from './FormField.module.css';
import type { FormFieldWebProps } from './FormField.types';

export type { FormFieldWebProps } from './FormField.types';

/**
 * Etiqueta, ayuda y error de un control (ADR-037). El `<label>` apunta al `id` que
 * toma el control, y la ayuda y el error se enlazan con `aria-describedby`.
 */
export function FormField({
  label,
  help,
  error,
  required = false,
  disabled = false,
  className,
  testID,
  children,
}: FormFieldWebProps) {
  const baseId = useId();
  const field = useMemo(
    () => createFormFieldValue(baseId, { label, help, error, disabled, required }),
    [baseId, label, help, error, disabled, required],
  );

  return (
    <FormFieldContext.Provider value={field}>
      <div className={cx(styles.root, disabled && styles.disabled, className)} data-testid={testID}>
        <label className={styles.label} htmlFor={field.controlId}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' *'}
            </span>
          ) : null}
        </label>
        {children}
        {field.help === undefined ? null : (
          <p id={field.helpId} className={styles.help}>
            {field.help}
          </p>
        )}
        {/* La región existe siempre: así el error se anuncia en el momento en que aparece. */}
        <div aria-live="polite">
          {field.error === undefined ? null : (
            <p id={field.errorId} className={styles.error}>
              <span className={styles.errorIcon}>
                <Icon name="circle-alert" size="sm" color="danger" />
              </span>
              {field.error}
            </p>
          )}
        </div>
      </div>
    </FormFieldContext.Provider>
  );
}
