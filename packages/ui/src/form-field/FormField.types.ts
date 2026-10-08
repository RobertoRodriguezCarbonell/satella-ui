import type { FormFieldProps } from '@satellatickets/core';
import type { StyleProp, ViewStyle } from 'react-native';

export type { FormFieldProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009). */
export interface FormFieldWebProps extends FormFieldProps {
  className?: string | undefined;
}

/** Extensión solo nativa del contrato. */
export interface FormFieldNativeProps extends FormFieldProps {
  style?: StyleProp<ViewStyle> | undefined;
}
