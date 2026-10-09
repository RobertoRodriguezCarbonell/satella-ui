import type { SelectProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

export type { SelectOption, SelectProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009): atributos de formulario y escape hatches. */
export interface SelectWebProps extends SelectProps {
  /** `id` del botón que abre la lista. Dentro de un `FormField` no hace falta: lo pone él. */
  id?: string | undefined;
  /** Nombre con el que viaja en un `<form>`. */
  name?: string | undefined;
  /** Se aplican a la caja del campo, no al botón. */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** El botón que abre la lista (ADR-042). */
  ref?: Ref<HTMLButtonElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface SelectNativeProps extends SelectProps {
  /** Se aplica al disparador, la caja que muestra la opción elegida. */
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<View> | undefined;
}
