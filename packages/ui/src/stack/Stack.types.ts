import type { StackProps } from '@satellatickets/core';
import type { StyleProp, ViewStyle } from 'react-native';

import type { BoxWebProps } from '../box/Box.types';

export type { StackProps } from '@satellatickets/core';

export interface StackWebProps
  extends StackProps, Pick<BoxWebProps, 'as' | 'className' | 'style'> {}

export interface StackNativeProps extends StackProps {
  style?: StyleProp<ViewStyle> | undefined;
}
