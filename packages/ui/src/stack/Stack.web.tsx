import type { StackAlign, StackDirection, StackJustify } from '@satellatickets/core';
import { cssVariables } from '@satellatickets/tokens';
import type { CSSProperties } from 'react';

import { cx } from '../_internal/cx';
import { Box } from '../box/Box';
import styles from './Stack.module.css';
import type { StackWebProps } from './Stack.types';

export type { StackWebProps } from './Stack.types';

const directionClass = {
  column: styles.column,
  row: styles.row,
} satisfies Record<StackDirection, string | undefined>;

const alignClass = {
  stretch: styles.alignStretch,
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} satisfies Record<StackAlign, string | undefined>;

const justifyClass = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
  around: styles.justifyAround,
} satisfies Record<StackJustify, string | undefined>;

export function Stack({
  direction = 'column',
  gap,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  style,
  ...boxProps
}: StackWebProps) {
  const gapStyle =
    gap === undefined
      ? undefined
      : ({ '--stack-gap': `var(${cssVariables[`space.${gap}`]})` } as CSSProperties);
  return (
    <Box
      {...boxProps}
      className={cx(
        styles.stack,
        directionClass[direction],
        alignClass[align],
        justifyClass[justify],
        wrap && styles.wrap,
        className,
      )}
      style={{ ...gapStyle, ...style }}
    />
  );
}
