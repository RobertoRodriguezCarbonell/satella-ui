import { textVariantStyles, useTheme, type TextAlign } from '@satellatickets/core';
import { Text as RNText, type TextStyle } from 'react-native';

import type { TextNativeProps } from './Text.types';

export type { TextNativeProps } from './Text.types';

const textAlign = {
  left: 'left',
  center: 'center',
  right: 'right',
} satisfies Record<TextAlign, TextStyle['textAlign']>;

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  truncate = false,
  numberOfLines,
  style,
  testID,
  children,
}: TextNativeProps) {
  const t = useTheme();
  const spec = textVariantStyles[variant];
  const computed: TextStyle = {
    fontSize: t.font.size[spec.size],
    lineHeight: t.font.lineHeight[spec.size],
    fontWeight: t.font.weight[spec.weight],
    color: t.color.text[color],
  };
  const family = t.font.family[spec.family];
  if (family !== undefined) computed.fontFamily = family;
  if (align !== undefined) computed.textAlign = textAlign[align];
  if (spec.uppercase) computed.textTransform = 'uppercase';
  if (spec.letterSpacing !== undefined) computed.letterSpacing = spec.letterSpacing;
  const lines = truncate ? 1 : numberOfLines;

  return (
    <RNText
      style={[computed, style]}
      numberOfLines={lines}
      ellipsizeMode="tail"
      accessibilityRole={spec.headingLevel === undefined ? undefined : 'header'}
      aria-level={spec.headingLevel}
      testID={testID}
    >
      {children}
    </RNText>
  );
}
