import { useTheme } from '@satellatickets/core';
import { View, type ViewStyle } from 'react-native';

import type { BoxNativeProps } from './Box.types';

export function Box({
  padding,
  paddingX,
  paddingY,
  background,
  radius,
  borderColor,
  shadow,
  flex,
  style,
  testID,
  children,
}: BoxNativeProps) {
  const t = useTheme();
  const computed: ViewStyle = {};
  if (padding !== undefined) computed.padding = t.space[padding];
  if (paddingX !== undefined) computed.paddingHorizontal = t.space[paddingX];
  if (paddingY !== undefined) computed.paddingVertical = t.space[paddingY];
  if (background !== undefined) computed.backgroundColor = t.color.bg[background];
  if (radius !== undefined) computed.borderRadius = t.radius[radius];
  if (borderColor !== undefined) {
    computed.borderWidth = t.borderWidth.thin;
    computed.borderColor = t.color.border[borderColor];
  }
  if (shadow !== undefined) computed.boxShadow = t.shadow[shadow];
  if (flex !== undefined) computed.flex = flex;

  return (
    <View style={[computed, style]} testID={testID}>
      {children}
    </View>
  );
}
