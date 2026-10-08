import { cssVariables } from '@satellatickets/tokens';

import { cx } from '../_internal/cx';
import styles from './Box.module.css';
import type { BoxWebProps } from './Box.types';

export type { BoxElement, BoxWebProps } from './Box.types';

type BoxVariables = Record<`--box-${string}`, string>;

export function Box({
  as: Tag = 'div',
  padding,
  paddingX,
  paddingY,
  background,
  radius,
  borderColor,
  shadow,
  flex,
  className,
  style,
  testID,
  children,
}: BoxWebProps) {
  const vars: BoxVariables = {};
  if (padding !== undefined) vars['--box-padding'] = `var(${cssVariables[`space.${padding}`]})`;
  if (paddingX !== undefined) vars['--box-padding-x'] = `var(${cssVariables[`space.${paddingX}`]})`;
  if (paddingY !== undefined) vars['--box-padding-y'] = `var(${cssVariables[`space.${paddingY}`]})`;
  if (background !== undefined) {
    vars['--box-background'] = `var(${cssVariables[`color.bg.${background}`]})`;
  }
  if (radius !== undefined) vars['--box-radius'] = `var(${cssVariables[`radius.${radius}`]})`;
  if (borderColor !== undefined) {
    vars['--box-border-color'] = `var(${cssVariables[`color.border.${borderColor}`]})`;
    vars['--box-border-width'] = `var(${cssVariables['borderWidth.thin']})`;
  }
  if (shadow !== undefined) vars['--box-shadow'] = `var(${cssVariables[`shadow.${shadow}`]})`;
  if (flex !== undefined) vars['--box-flex'] = String(flex);

  return (
    <Tag className={cx(styles.root, className)} style={{ ...vars, ...style }} data-testid={testID}>
      {children}
    </Tag>
  );
}
