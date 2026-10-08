import type { CheckboxProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

export type { CheckboxProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009): atributos de formulario y escape hatches. */
export interface CheckboxWebProps extends CheckboxProps {
  id?: string | undefined;
  /** Nombre con el que viaja en un `<form>`. */
  name?: string | undefined;
  /** Valor que viaja en el `<form>` cuando está marcada (por defecto `on`). */
  value?: string | undefined;
  /** Se aplican a la etiqueta que envuelve la casilla y su texto. */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLInputElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface CheckboxNativeProps extends CheckboxProps {
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<View> | undefined;
}
