import type { BoxProps } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { BoxProps } from '@satellatickets/core';

export type BoxElement =
  'div' | 'section' | 'article' | 'header' | 'footer' | 'nav' | 'main' | 'aside' | 'span';

/** Extensión solo web del contrato (ADR-009): elemento semántico y escape hatches. */
export interface BoxWebProps extends BoxProps {
  as?: BoxElement | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Extensión solo nativa del contrato. */
export interface BoxNativeProps extends BoxProps {
  style?: StyleProp<ViewStyle> | undefined;
}
