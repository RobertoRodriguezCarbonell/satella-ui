import type { CardVariant } from '@satellatickets/core';
import { cssVariables } from '@satellatickets/tokens';
import type { KeyboardEvent } from 'react';

import { cx } from '../_internal/cx';
import styles from './Card.module.css';
import type { CardWebProps } from './Card.types';

export type { CardWebProps } from './Card.types';

// Mapa exhaustivo (ADR-014): una variante nueva en `core` no compila hasta que tenga
// aquí su clase.
const variantClass = {
  outlined: styles.outlined,
  elevated: styles.elevated,
} satisfies Record<CardVariant, string | undefined>;

export function Card({
  variant = 'outlined',
  padding = 4,
  onPress,
  accessibilityLabel,
  className,
  style,
  testID,
  ref,
  children,
}: CardWebProps) {
  const vars: Record<`--card-${string}`, string> = {
    '--card-padding': `var(${cssVariables[`space.${padding}`]})`,
  };
  const classes = cx(
    styles.root,
    variantClass[variant],
    onPress !== undefined && styles.interactive,
    className,
  );

  if (onPress === undefined) {
    return (
      <div ref={ref} className={classes} style={{ ...vars, ...style }} data-testid={testID}>
        {children}
      </div>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Solo si el foco está en la tarjeta, y como un `<button>`: Intro y Espacio.
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onPress?.();
  }

  // Un `<button>` no admite el contenido de una tarjeta (títulos, párrafos, imágenes):
  // por eso es un `div` con el rol, el foco y el teclado de un botón.
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={classes}
      style={{ ...vars, ...style }}
      aria-label={accessibilityLabel}
      data-testid={testID}
      onClick={onPress}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
