import { iconSizePx, isFeedbackTone, useTheme } from '@satellatickets/core';
import { ICON_STROKE_WIDTH, ICON_VIEWBOX, icons, type IconElement } from '@satellatickets/icons';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import type { IconNativeProps } from './Icon.types';

export type { IconNativeProps } from './Icon.types';

function renderElement(element: IconElement, index: number) {
  switch (element.type) {
    case 'path':
      return <Path key={index} d={element.d} />;
    case 'circle':
      return <Circle key={index} cx={element.cx} cy={element.cy} r={element.r} />;
    case 'line':
      return <Line key={index} x1={element.x1} y1={element.y1} x2={element.x2} y2={element.y2} />;
    case 'rect':
      return (
        <Rect
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
  style,
  testID,
}: IconNativeProps) {
  const t = useTheme();
  const px = iconSizePx[size];
  const decorative = label === undefined;
  // react-native-svg no admite `undefined` explícito en sus props opcionales.
  const optional = {
    ...(style === undefined ? {} : { style }),
    ...(testID === undefined ? {} : { testID }),
    ...(decorative
      ? {
          accessibilityElementsHidden: true,
          importantForAccessibility: 'no-hide-descendants' as const,
        }
      : { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: label }),
  };
  return (
    <Svg
      width={px}
      height={px}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      fill="none"
      // Un color de texto o el icono de un estado de feedback.
      stroke={isFeedbackTone(color) ? t.color.feedback[color].icon : t.color.text[color]}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...optional}
    >
      {icons[name].map(renderElement)}
    </Svg>
  );
}
