import type { AlertProps } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { AlertProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export type AlertWebProps = AlertProps & {
  className?: string | undefined;
  style?: CSSProperties | undefined;
};

/** Extensión solo nativa del contrato. */
export type AlertNativeProps = AlertProps & {
  style?: StyleProp<ViewStyle> | undefined;
};
