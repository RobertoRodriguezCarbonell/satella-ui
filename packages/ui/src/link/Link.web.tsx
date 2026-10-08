import { textVariantStyles, useLink, type LinkUnderline } from '@satellatickets/core';
import { cssVariables } from '@satellatickets/tokens';
import type { MouseEvent } from 'react';

import { cx } from '../_internal/cx';
import styles from './Link.module.css';
import type { LinkWebProps } from './Link.types';

export type { LinkWebProps } from './Link.types';

// Mapa exhaustivo (ADR-014): un modo de subrayado nuevo en `core` no compila hasta
// que tenga aquí su clase.
const underlineClass = {
  always: styles.always,
  hover: styles.hover,
} satisfies Record<LinkUnderline, string | undefined>;

export function Link({
  href,
  variant,
  color = 'link',
  underline = 'always',
  onPress,
  accessibilityLabel,
  target,
  rel,
  className,
  style,
  testID,
  ref,
  children,
}: LinkWebProps) {
  const { press } = useLink({ onPress });
  const spec = variant === undefined ? undefined : textVariantStyles[variant];

  const vars: Record<`--link-${string}`, string> = {
    '--link-color': `var(${cssVariables[`color.text.${color}`]})`,
  };
  if (spec !== undefined) {
    vars['--link-family'] = `var(${cssVariables[`font.family.${spec.family}`]})`;
    vars['--link-size'] = `var(${cssVariables[`font.size.${spec.size}`]})`;
    vars['--link-line-height'] = `var(${cssVariables[`font.lineHeight.${spec.size}`]})`;
    vars['--link-weight'] = `var(${cssVariables[`font.weight.${spec.weight}`]})`;
    if (spec.letterSpacing !== undefined) vars['--link-letter-spacing'] = `${spec.letterSpacing}px`;
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Con un modificador o con otro botón del ratón manda el navegador: abrir en una
    // pestaña nueva, descargar… La app no debe interceptarlo.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (!press()) event.preventDefault();
  }

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      // Sin `noopener`, la página abierta en otra pestaña puede manipular esta.
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      className={cx(
        styles.root,
        underlineClass[underline],
        spec !== undefined && styles.typed,
        spec?.uppercase && styles.uppercase,
        className,
      )}
      style={{ ...vars, ...style }}
      aria-label={accessibilityLabel}
      data-testid={testID}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
