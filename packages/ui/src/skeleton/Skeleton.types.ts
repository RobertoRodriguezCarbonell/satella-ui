import type { SkeletonProps } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { SkeletonProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export interface SkeletonWebProps extends SkeletonProps {
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Extensión solo nativa del contrato. */
export interface SkeletonNativeProps extends SkeletonProps {
  style?: StyleProp<ViewStyle> | undefined;
}
