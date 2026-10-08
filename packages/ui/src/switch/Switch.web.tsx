import { cx } from '../_internal/cx';
import styles from './Switch.module.css';
import type { SwitchWebProps } from './Switch.types';

export type { SwitchWebProps } from './Switch.types';

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  accessibilityLabel,
  id,
  name,
  value,
  className,
  style,
  testID,
  ref,
  children,
}: SwitchWebProps) {
  return (
    <label className={cx(styles.root, disabled && styles.disabled, className)} style={style}>
      <input
        ref={ref}
        type="checkbox"
        // Un `checkbox` con este rol se anuncia como interruptor (activado / desactivado)
        // y sigue viajando en un `<form>`.
        role="switch"
        className={styles.input}
        id={id}
        name={name}
        value={value}
        // Controlado si la app pasa `checked`; si no, el navegador guarda el estado (ADR-037).
        {...(checked === undefined ? { defaultChecked } : { checked })}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        disabled={disabled}
        aria-label={accessibilityLabel}
        data-testid={testID}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      {children === undefined || children === null ? null : (
        <span className={styles.label}>{children}</span>
      )}
    </label>
  );
}
