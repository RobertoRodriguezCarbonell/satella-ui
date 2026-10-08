import {
  iconButtonIconSize,
  useButton,
  type ButtonSize,
  type ButtonVariant,
} from '@satellatickets/core';
import type { MouseEvent } from 'react';

import { cx } from '../_internal/cx';
import buttonStyles from '../button/Button.module.css';
import { Icon } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import styles from './IconButton.module.css';
import type { IconButtonWebProps } from './IconButton.types';

export type { IconButtonWebProps } from './IconButton.types';

// Mapas exhaustivos (ADR-014). Las variantes son las clases de `Button`: un
// `IconButton` se ve y se comporta como un botón, solo cambia su forma.
const variantClass = {
  primary: buttonStyles.primary,
  secondary: buttonStyles.secondary,
  ghost: buttonStyles.ghost,
  danger: buttonStyles.danger,
} satisfies Record<ButtonVariant, string | undefined>;

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} satisfies Record<ButtonSize, string | undefined>;

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  type = 'button',
  className,
  style,
  testID,
  ref,
}: IconButtonWebProps) {
  const { interactive, press } = useButton({ disabled, loading, onPress });
  const iconSize = iconButtonIconSize[size];

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
        buttonStyles.root,
        variantClass[variant],
        sizeClass[size],
        loading && buttonStyles.loading,
        className,
      )}
      style={style}
      disabled={disabled}
      aria-disabled={loading ? true : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={label}
      data-testid={testID}
      onClick={handleClick}
    >
      <span className={buttonStyles.content}>
        <Icon name={icon} size={iconSize} />
      </span>
      {loading ? (
        <span className={buttonStyles.spinner}>
          <Spinner size={iconSize} />
        </span>
      ) : null}
    </button>
  );
}
