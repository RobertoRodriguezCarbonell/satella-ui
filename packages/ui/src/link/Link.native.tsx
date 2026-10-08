import { textVariantStyles, useLink, useTheme, type LinkUnderline } from '@satellatickets/core';
import { useContext, useState } from 'react';
import { Linking, Text as RNText, type TextStyle } from 'react-native';

import { TextAncestorContext } from '../text/TextAncestor';
import type { LinkNativeProps } from './Link.types';

export type { LinkNativeProps } from './Link.types';

// Mapa exhaustivo (ADR-014): un modo de subrayado nuevo en `core` no compila hasta
// que diga aquí si se subraya en reposo.
const underlinedAtRest = {
  always: true,
  hover: false,
} satisfies Record<LinkUnderline, boolean>;

export function Link({
  href,
  variant,
  color = 'link',
  underline = 'always',
  onPress,
  accessibilityLabel,
  style,
  testID,
  ref,
  children,
}: LinkNativeProps) {
  const t = useTheme();
  const insideText = useContext(TextAncestorContext);
  const { press } = useLink({ onPress });
  const [pressed, setPressed] = useState(false);

  // Sin `variant`, dentro de un `Text` hereda su tipografía (React Native la propaga
  // a los `Text` anidados); fuera, usa `body` para no caer en la fuente del sistema.
  const spec =
    variant === undefined
      ? insideText
        ? undefined
        : textVariantStyles.body
      : textVariantStyles[variant];

  // Mientras se pulsa: color del texto principal y subrayado, como `:active` y `:hover` en web.
  const computed: TextStyle = {
    color: t.color.text[pressed ? 'primary' : color],
    textDecorationLine: underlinedAtRest[underline] || pressed ? 'underline' : 'none',
  };
  if (spec !== undefined) {
    computed.fontSize = t.font.size[spec.size];
    computed.lineHeight = t.font.lineHeight[spec.size];
    computed.fontWeight = t.font.weight[spec.weight];
    const family = t.font.family[spec.family];
    if (family !== undefined) computed.fontFamily = family;
    if (spec.uppercase) computed.textTransform = 'uppercase';
    if (spec.letterSpacing !== undefined) computed.letterSpacing = spec.letterSpacing;
  }

  function handlePress() {
    if (!press()) return;
    Linking.openURL(href).catch((error: unknown) => {
      // Una ruta interna ("/eventos") no la puede abrir el sistema: navega la app en `onPress`.
      if (__DEV__) console.warn(`Link: no se pudo abrir "${href}".`, error);
    });
  }

  return (
    <RNText
      ref={ref}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      // El estado pulsado ya lo pinta el componente con tokens.
      suppressHighlighting
      style={[computed, style]}
      testID={testID}
    >
      <TextAncestorContext.Provider value={true}>{children}</TextAncestorContext.Provider>
    </RNText>
  );
}
