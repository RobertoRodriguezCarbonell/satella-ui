import type { CardProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

export type { CardProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export interface CardWebProps extends CardProps {
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLDivElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface CardNativeProps extends CardProps {
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<View> | undefined;
}
