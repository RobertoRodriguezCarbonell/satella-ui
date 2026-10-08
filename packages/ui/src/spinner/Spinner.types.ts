import type { SpinnerProps } from '@satellatickets/core';
import type { StyleProp, ViewStyle } from 'react-native';

export type { SpinnerProps } from '@satellatickets/core';

export interface SpinnerWebProps extends SpinnerProps {
  className?: string | undefined;
}

export interface SpinnerNativeProps extends SpinnerProps {
  style?: StyleProp<ViewStyle> | undefined;
}
