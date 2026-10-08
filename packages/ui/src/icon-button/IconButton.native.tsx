import { iconButtonIconSize, useButton, useTheme, type TextColorToken } from '@satellatickets/core';
import { useState } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { variantStyles } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import type { IconButtonNativeProps } from './IconButton.types';

export type { IconButtonNativeProps } from './IconButton.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
  testID,
  ref,
}: IconButtonNativeProps) {
  const t = useTheme();
  const { interactive, press } = useButton({ disabled, loading, onPress });
  const [focused, setFocused] = useState(false);

  // Los tokens de cada variante son los de `Button`: un `IconButton` se ve y se
  // comporta como un botón, solo cambia su forma.
  const colors = variantStyles[variant](t);
  const side = t.size.control[size];
  const content: TextColorToken = disabled ? 'disabled' : colors.content;
  const iconSize = iconButtonIconSize[size];

  const container: ViewStyle = {
    width: side,
    height: side,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.thin,
    borderColor: disabled ? 'transparent' : colors.border,
  };
  // Anillo de foco para teclado físico o mando, equivalente a `:focus-visible` en web.
  const focusRing: ViewStyle = {
    outlineStyle: 'solid',
    outlineColor: t.color.border.focus,
    outlineWidth: t.borderWidth.thick,
    outlineOffset: t.borderWidth.thick,
  };

  // El área táctil nunca baja de la altura del control por defecto (44 pt).
  const hitSlop = Math.max(0, (t.size.control.md - side) / 2);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !interactive, busy: loading }}
      disabled={!interactive}
      hitSlop={hitSlop}
      onPress={press}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        container,
        {
          backgroundColor: disabled
            ? colors.disabled
            : pressed
              ? colors.pressed
              : colors.background,
        },
        focused && focusRing,
        style,
      ]}
    >
      {/* Cargando: el spinner ocupa el sitio del icono, que mide lo mismo. */}
      {loading ? (
        <Spinner size={iconSize} color={content} />
      ) : (
        <Icon name={icon} size={iconSize} color={content} />
      )}
    </Pressable>
  );
}
