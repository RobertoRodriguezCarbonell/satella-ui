import { textVariantStyles, type TextAlign, type TextVariant } from '@satellatickets/core';
import { cssVariables } from '@satellatickets/tokens';

import { cx } from '../_internal/cx';
import styles from './Text.module.css';
import type { TextElement, TextWebProps } from './Text.types';

export type { TextElement, TextWebProps } from './Text.types';

const defaultElement = {
  hero: 'h1',
  display: 'h1',
  title: 'h2',
  heading: 'h3',
  subheading: 'h4',
  body: 'p',
  bodySmall: 'p',
  label: 'span',
  caption: 'span',
  code: 'code',
} satisfies Record<TextVariant, TextElement>;

const alignClass = {
  left: styles.left,
  center: styles.center,
  right: styles.right,
} satisfies Record<TextAlign, string | undefined>;

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  truncate = false,
  as,
  className,
  style,
  testID,
  children,
}: TextWebProps) {
  const spec = textVariantStyles[variant];
  const Tag = as ?? defaultElement[variant];
  const vars: Record<`--text-${string}`, string> = {
    '--text-family': `var(${cssVariables[`font.family.${spec.family}`]})`,
    '--text-size': `var(${cssVariables[`font.size.${spec.size}`]})`,
    '--text-line-height': `var(${cssVariables[`font.lineHeight.${spec.size}`]})`,
    '--text-weight': `var(${cssVariables[`font.weight.${spec.weight}`]})`,
    '--text-color': `var(${cssVariables[`color.text.${color}`]})`,
  };
  if (spec.letterSpacing !== undefined) vars['--text-letter-spacing'] = `${spec.letterSpacing}px`;

  return (
    <Tag
      className={cx(
        styles.root,
        spec.uppercase && styles.uppercase,
        align && alignClass[align],
        truncate && styles.truncate,
        className,
      )}
      style={{ ...vars, ...style }}
      data-testid={testID}
    >
      {children}
    </Tag>
  );
}
