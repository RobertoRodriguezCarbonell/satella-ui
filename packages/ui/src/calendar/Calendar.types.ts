import type { CalendarProps as CalendarContract } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type { CalendarMode, CalendarSize, DateRange, Weekday } from '@satellatickets/core';

/** Contrato de `Calendar`. */
export type CalendarProps = CalendarContract;

/** Extensión solo web del contrato (ADR-009). */
export type CalendarWebProps = CalendarProps & {
  className?: string | undefined;
  style?: CSSProperties | undefined;
};

/** Extensión solo nativa del contrato. */
export type CalendarNativeProps = CalendarProps & {
  style?: StyleProp<ViewStyle> | undefined;
};
