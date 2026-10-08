import type { BadgeProps } from '@satellatickets/core';
import type { StyleProp, ViewStyle } from 'react-native';

export type { BadgeProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export interface BadgeWebProps extends BadgeProps {
  className?: string | undefined;
}

/** Extensión solo nativa del contrato. */
export interface BadgeNativeProps extends BadgeProps {
  style?: StyleProp<ViewStyle> | undefined;
}
