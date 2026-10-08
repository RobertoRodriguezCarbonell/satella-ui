import { iconSizePx } from '@satellatickets/core';
import { ICON_STROKE_WIDTH, ICON_VIEWBOX, icons, type IconElement } from '@satellatickets/icons';
import { cssVariables } from '@satellatickets/tokens';

import { cx } from '../_internal/cx';
import styles from './Icon.module.css';
import type { IconWebProps } from './Icon.types';

export type { IconWebProps } from './Icon.types';

function renderElement(element: IconElement, index: number) {
  switch (element.type) {
    case 'path':
      return <path key={index} d={element.d} />;
    case 'circle':
      return <circle key={index} cx={element.cx} cy={element.cy} r={element.r} />;
    case 'line':
      return <line key={index} x1={element.x1} y1={element.y1} x2={element.x2} y2={element.y2} />;
    case 'rect':
      return (
        <rect
          key={index}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          {...(element.rx === undefined ? {} : { rx: element.rx })}
        />
      );
  }
}

export function Icon({
  name,
  size = 'md',
  color = 'primary',
  label,
  className,
  testID,
}: IconWebProps) {
  const px = iconSizePx[size];
  const decorative = label === undefined;
  return (
    <svg
      className={cx(styles.root, className)}
      width={px}
      height={px}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      fill="none"
      stroke={`var(${cssVariables[`color.text.${color}`]})`}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : 'img'}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      data-testid={testID}
    >
      {decorative ? null : <title>{label}</title>}
      {icons[name].map(renderElement)}
    </svg>
  );
}
