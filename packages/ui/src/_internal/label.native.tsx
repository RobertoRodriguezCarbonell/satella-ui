import { Children, type ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

/**
 * El texto como `children` se envuelve en `<Text>`, porque React Native no admite texto
 * suelto dentro de una vista; cualquier otro contenido se deja tal cual (CLAUDE.md §5).
 */
export function renderLabel(children: ReactNode, style: StyleProp<TextStyle>): ReactNode {
  const isText = Children.toArray(children).every(
    (child) => typeof child === 'string' || typeof child === 'number',
  );
  return isText ? <Text style={style}>{children}</Text> : children;
}
