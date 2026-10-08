import { textVariantStyles, type SkeletonShape } from '@satellatickets/core';
import { cssVariables } from '@satellatickets/tokens';

import { cx } from '../_internal/cx';
import styles from './Skeleton.module.css';
import type { SkeletonWebProps } from './Skeleton.types';

export type { SkeletonWebProps } from './Skeleton.types';

// Mapa exhaustivo (ADR-014): una forma nueva en `core` no compila hasta que tenga
// aquí su clase.
const shapeClass = {
  text: styles.line,
  rectangle: styles.rectangle,
  circle: styles.circle,
} satisfies Record<SkeletonShape, string | undefined>;

function dimension(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** Decorativo: los lectores de pantalla lo ignoran. */
export function Skeleton({
  shape = 'text',
  width,
  height,
  variant = 'body',
  lines = 1,
  className,
  style,
  testID,
}: SkeletonWebProps) {
  const vars: Record<`--skeleton-${string}`, string> = {};
  if (width !== undefined) vars['--skeleton-width'] = dimension(width);

  if (shape === 'text') {
    const spec = textVariantStyles[variant];
    vars['--skeleton-font-size'] = `var(${cssVariables[`font.size.${spec.size}`]})`;
    vars['--skeleton-line-height'] = `var(${cssVariables[`font.lineHeight.${spec.size}`]})`;
    return (
      <span
        className={cx(styles.root, className)}
        style={{ ...vars, ...style }}
        aria-hidden="true"
        data-testid={testID}
      >
        {Array.from({ length: Math.max(1, lines) }, (_, index) => (
          <span key={index} className={cx(styles.bar, shapeClass.text)} />
        ))}
      </span>
    );
  }

  if (height !== undefined) vars['--skeleton-height'] = dimension(height);
  return (
    <span
      className={cx(styles.root, styles.bar, shapeClass[shape], className)}
      style={{ ...vars, ...style }}
      aria-hidden="true"
      data-testid={testID}
    />
  );
}
