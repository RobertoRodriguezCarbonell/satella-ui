import { useTheme, type StackAlign, type StackJustify } from '@satellatickets/core';
import type { ViewStyle } from 'react-native';

import { Box } from '../box/Box';
import type { StackNativeProps } from './Stack.types';

export type { StackNativeProps } from './Stack.types';

const alignItems = {
  stretch: 'stretch',
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
} satisfies Record<StackAlign, ViewStyle['alignItems']>;

const justifyContent = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
} satisfies Record<StackJustify, ViewStyle['justifyContent']>;

export function Stack({
  direction = 'column',
  gap,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  style,
  ...boxProps
}: StackNativeProps) {
  const t = useTheme();
  const layout: ViewStyle = {
    flexDirection: direction,
    alignItems: alignItems[align],
    justifyContent: justifyContent[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };
  if (gap !== undefined) layout.gap = t.space[gap];
  return <Box {...boxProps} style={[layout, style]} />;
}
