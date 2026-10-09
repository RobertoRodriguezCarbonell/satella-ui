import type { DatePickerProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

export type { DatePickerProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009): atributos de formulario y escape hatches. */
export interface DatePickerWebProps extends DatePickerProps {
  /** `id` del botón que abre el calendario. Dentro de un `FormField` no hace falta: lo pone él. */
  id?: string | undefined;
  /** Nombre con el que la fecha viaja en un `<form>`, como texto ISO. */
  name?: string | undefined;
  /** Se aplican a la caja del campo, no al botón. */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** El botón que abre el calendario. */
  ref?: Ref<HTMLButtonElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface DatePickerNativeProps extends DatePickerProps {
  /** Se aplica al disparador, la caja que muestra la fecha elegida. */
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<View> | undefined;
}
