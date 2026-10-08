import type { DividerProps } from '@satellatickets/core';
import type { StyleProp, ViewStyle } from 'react-native';

export type { DividerProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export interface DividerWebProps extends DividerProps {
  className?: string | undefined;
}

/** Extensión solo nativa del contrato. */
export interface DividerNativeProps extends DividerProps {
  style?: StyleProp<ViewStyle> | undefined;
}
