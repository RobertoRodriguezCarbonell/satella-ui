import type { InputProps as InputContract } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, TextInput, ViewStyle } from 'react-native';

import type { IconName } from '../icon/Icon.types';

/** Contrato de `Input` con el conjunto de iconos de la librería. */
export type InputProps = InputContract<IconName>;

/** Extensión solo web del contrato (ADR-009): atributos de formulario y escape hatches. */
export interface InputWebProps extends InputProps {
  /** `id` del `<input>`. Dentro de un `FormField` no hace falta: lo pone él. */
  id?: string | undefined;
  /** Nombre con el que viaja en un `<form>`. */
  name?: string | undefined;
  /** Pista de autocompletado del navegador (`email`, `current-password`, `one-time-code`…). */
  autoComplete?: string | undefined;
  /** Se aplican a la caja del campo, no al `<input>`. */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLInputElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface InputNativeProps extends InputProps {
  /** Se aplica a la caja del campo, no al `TextInput`. */
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<TextInput> | undefined;
}
