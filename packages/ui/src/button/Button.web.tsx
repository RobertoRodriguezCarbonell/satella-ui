import {
  buttonIconSize,
  useButton,
  type ButtonSize,
  type ButtonVariant,
} from '@satellatickets/core';
import type { MouseEvent } from 'react';

import { cx } from '../_internal/cx';
import { Icon } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import styles from './Button.module.css';
import type { ButtonWebProps } from './Button.types';

// Mapas exhaustivos (ADR-014): una variante o un tamaño nuevos en `core` no compilan
// hasta que tengan aquí su clase.
const variantClass = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
} satisfies Record<ButtonVariant, string | undefined>;

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} satisfies Record<ButtonSize, string | undefined>;

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  onPress,
  accessibilityLabel,
  type = 'button',
  className,
  style,
  testID,
  ref,
  children,
}: ButtonWebProps) {
  const { interactive, press } = useButton({ disabled, loading, onPress });
  const iconSize = buttonIconSize[size];

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Mientras carga, el botón sigue enfocable (`aria-disabled`), así que el clic
    // llega: se cancela para que un `type="submit"` no envíe el formulario.
    if (!interactive) event.preventDefault();
    press();
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.root,
        variantClass[variant],
        sizeClass[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      style={style}
      disabled={disabled}
      aria-disabled={loading ? true : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={accessibilityLabel}
      data-testid={testID}
      onClick={handleClick}
    >
      <span className={styles.content}>
        {iconStart === undefined ? null : <Icon name={iconStart} size={iconSize} />}
        <span className={styles.label}>{children}</span>
        {iconEnd === undefined ? null : <Icon name={iconEnd} size={iconSize} />}
      </span>
      {loading ? (
        <span className={styles.spinner}>
          <Spinner size={iconSize} />
        </span>
      ) : null}
    </button>
  );
}
