import type { BadgeVariant } from '@satellatickets/core';

import { cx } from '../_internal/cx';
import styles from './Badge.module.css';
import type { BadgeWebProps } from './Badge.types';

export type { BadgeWebProps } from './Badge.types';

// Mapa exhaustivo (ADR-014): una variante nueva en `core` no compila hasta que tenga
// aquí su clase.
const variantClass = {
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
} satisfies Record<BadgeVariant, string | undefined>;

export function Badge({ variant = 'info', className, testID, children }: BadgeWebProps) {
  return (
    <span className={cx(styles.root, variantClass[variant], className)} data-testid={testID}>
      {children}
    </span>
  );
}
