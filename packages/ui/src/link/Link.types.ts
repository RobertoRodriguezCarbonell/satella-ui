import type { LinkProps } from '@satellatickets/core';
import type { CSSProperties, Ref } from 'react';
import type { StyleProp, Text, TextStyle } from 'react-native';

export type { LinkPressEvent, LinkProps } from '@satellatickets/core';

/** Extensión solo web del contrato (ADR-009): atributos del `<a>` y escape hatches. */
export interface LinkWebProps extends LinkProps {
  /** Dónde se abre. Con `_blank` se añade `rel="noopener noreferrer"` si no se indica otro. */
  target?: '_self' | '_blank' | '_parent' | '_top' | undefined;
  rel?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLAnchorElement> | undefined;
}

/** Extensión solo nativa del contrato. */
export interface LinkNativeProps extends LinkProps {
  style?: StyleProp<TextStyle> | undefined;
  ref?: Ref<Text> | undefined;
}
