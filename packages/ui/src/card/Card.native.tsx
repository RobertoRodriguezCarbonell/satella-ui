import { useTheme, type CardVariant } from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import type { CardNativeProps } from './Card.types';

export type { CardNativeProps } from './Card.types';

// Mapa exhaustivo (ADR-014): una variante nueva en `core` no compila hasta que tenga
// aquí sus tokens.
const variantStyle = {
  outlined: (t) => ({ backgroundColor: t.color.bg.surface }),
  elevated: (t) => ({ backgroundColor: t.color.bg.elevated, boxShadow: t.shadow.md }),
} satisfies Record<CardVariant, (t: Theme) => ViewStyle>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  // Recorta el contenido que llega hasta el borde, por ejemplo una imagen.
  root: { alignSelf: 'stretch', overflow: 'hidden' },
});

export function Card({
  variant = 'outlined',
  padding = 4,
  onPress,
  accessibilityLabel,
  style,
  testID,
  ref,
  children,
}: CardNativeProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const container: ViewStyle = {
    padding: t.space[padding],
    borderWidth: t.borderWidth.thin,
    borderRadius: t.radius.lg,
    borderColor: t.color.border.default,
    ...variantStyle[variant](t),
  };

  if (onPress === undefined) {
    return (
      <View ref={ref} style={[styles.root, container, style]} testID={testID}>
        {children}
      </View>
    );
  }

  // Anillo de foco para teclado físico o mando, equivalente a `:focus-visible` en web.
  const focusRing: ViewStyle = {
    outlineStyle: 'solid',
    outlineColor: t.color.border.focus,
    outlineWidth: t.borderWidth.thick,
    outlineOffset: t.borderWidth.thick,
  };

  // Pulsable: toda la tarjeta es un botón.
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={testID}
      style={({ pressed }) => [
        styles.root,
        container,
        pressed && { backgroundColor: t.color.bg.subtle },
        focused && focusRing,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
