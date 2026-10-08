import type { TextProps } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

export type { TextProps } from '@satellatickets/core';

export type TextElement =
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'code';

export interface TextWebProps extends TextProps {
  /** Elemento HTML. Por defecto, el que corresponde a la variante (h1–h4, p, span, code). */
  as?: TextElement | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface TextNativeProps extends TextProps {
  numberOfLines?: number | undefined;
  style?: StyleProp<TextStyle> | undefined;
}
