import type { ButtonProps as ButtonContract } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

import type { IconName } from '../icon/Icon.types';

/** Contrato de `Button` con el conjunto de iconos de la librería. */
export type ButtonProps = ButtonContract<IconName>;

/** Extensión solo web del contrato (ADR-009): atributos de formulario y escape hatches. */
export interface ButtonWebProps extends ButtonProps {
  /** Tipo del `<button>`. Por defecto `button`, para no enviar formularios por accidente. */
  type?: 'button' | 'submit' | 'reset' | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLButtonElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface ButtonNativeProps extends ButtonProps {
  style?: StyleProp<ViewStyle> | undefined;
  ref?: Ref<View> | undefined;
}
