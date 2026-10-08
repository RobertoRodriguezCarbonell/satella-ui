import type { DividerOrientation } from '@satellatickets/core';

import { cx } from '../_internal/cx';
import styles from './Divider.module.css';
import type { DividerWebProps } from './Divider.types';

export type { DividerWebProps } from './Divider.types';

// Mapa exhaustivo (ADR-014): una orientación nueva en `core` no compila hasta que
// tenga aquí su clase.
const orientationClass = {
  horizontal: styles.horizontal,
  vertical: styles.vertical,
} satisfies Record<DividerOrientation, string | undefined>;

export function Divider({ orientation = 'horizontal', className, testID }: DividerWebProps) {
  const classes = cx(styles.root, orientationClass[orientation], className);
  // `<hr>` ya es un separador horizontal; en vertical hay que decirlo.
  return orientation === 'horizontal' ? (
    <hr className={classes} data-testid={testID} />
  ) : (
    <div role="separator" aria-orientation="vertical" className={classes} data-testid={testID} />
  );
}
