import type { TextAreaProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, TextInput, ViewStyle } from 'react-native';

export type { TextAreaProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009): atributos de formulario y escape hatches. */
export interface TextAreaWebProps extends TextAreaProps {
  /** `id` del `<textarea>`. Dentro de un `FormField` no hace falta: lo pone él. */
  id?: string | undefined;
  /** Nombre con el que viaja en un `<form>`. */
  name?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLTextAreaElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface TextAreaNativeProps extends TextAreaProps {
  /** Se aplica a la caja del campo, no al `TextInput`. */
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<TextInput> | undefined;
}
