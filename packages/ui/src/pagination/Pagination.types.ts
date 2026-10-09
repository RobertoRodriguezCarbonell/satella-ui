import type { PaginationProps } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { PaginationProps, PaginationSize } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). Se aplican al `<nav>`. */
export interface PaginationWebProps extends PaginationProps {
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Extensión solo nativa del contrato. */
export interface PaginationNativeProps extends PaginationProps {
  style?: StyleProp<ViewStyle> | undefined;
}
