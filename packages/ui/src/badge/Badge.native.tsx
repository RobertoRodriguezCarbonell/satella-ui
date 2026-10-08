import { useTheme, type BadgeVariant } from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import type { BadgeNativeProps } from './Badge.types';

/** Fondo, borde y texto de un color de feedback. */
type FeedbackColors = Theme['color']['feedback'][BadgeVariant];

// Mapa exhaustivo (ADR-014): una variante nueva en `core` no compila hasta que tenga
// aquí sus tokens.
const variantColors = {
  success: (t) => t.color.feedback.success,
  warning: (t) => t.color.feedback.warning,
  danger: (t) => t.color.feedback.danger,
  info: (t) => t.color.feedback.info,
} satisfies Record<BadgeVariant, (t: Theme) => FeedbackColors>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center' },
});

export function Badge({ variant = 'info', style, testID, children }: BadgeNativeProps) {
  const t = useTheme();
  const colors = variantColors[variant](t);

  const container: ViewStyle = {
    paddingVertical: t.space[1],
    paddingHorizontal: t.space[2],
    borderRadius: t.radius.full,
    borderWidth: t.borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  };
  const label: TextStyle = {
    flexShrink: 1,
    fontSize: t.font.size.xs,
    lineHeight: t.font.lineHeight.xs,
    fontWeight: t.font.weight.medium,
    color: colors.text,
  };
  const family = t.font.family.sans;
  if (family !== undefined) label.fontFamily = family;

  return (
    <View testID={testID} style={[styles.base, container, style]}>
      <Text style={label}>{children}</Text>
    </View>
  );
}
