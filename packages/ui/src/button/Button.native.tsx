import {
  buttonIconSize,
  useButton,
  useTheme,
  type ButtonSize,
  type ButtonVariant,
  type TextColorToken,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';

import { renderLabel } from '../_internal/label';
import { Icon } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import type { ButtonNativeProps } from './Button.types';

export type { ButtonNativeProps } from './Button.types';

interface VariantStyle {
  background: string;
  /** Fondo mientras se mantiene pulsado. */
  pressed: string;
  /** Fondo cuando está deshabilitado. */
  disabled: string;
  border: string;
  /** Color del texto, los iconos y el spinner. */
  content: TextColorToken;
}

interface SizeStyle {
  minHeight: number;
  paddingHorizontal: number;
  /** Solo se nota si el texto ocupa más de una línea. */
  paddingVertical: number;
  fontSize: number;
  lineHeight: number;
}

// Mapas exhaustivos (ADR-014): una variante o un tamaño nuevos en `core` no compilan
// hasta que tengan aquí sus tokens. `IconButton` reutiliza el de variantes.
export const variantStyles = {
  primary: (t) => ({
    background: t.color.action.primary,
    pressed: t.color.action.primaryActive,
    disabled: t.color.action.disabled,
    border: 'transparent',
    content: 'onPrimary',
  }),
  secondary: (t) => ({
    background: t.color.action.secondary,
    pressed: t.color.action.secondaryActive,
    disabled: t.color.action.disabled,
    border: t.color.border.default,
    content: 'primary',
  }),
  ghost: (t) => ({
    background: 'transparent',
    pressed: t.color.bg.muted,
    disabled: 'transparent',
    border: 'transparent',
    content: 'primary',
  }),
  danger: (t) => ({
    background: t.color.action.danger,
    pressed: t.color.action.dangerActive,
    disabled: t.color.action.disabled,
    border: 'transparent',
    content: 'onDanger',
  }),
} satisfies Record<ButtonVariant, (t: Theme) => VariantStyle>;

const sizeStyles = {
  sm: (t) => ({
    minHeight: t.size.control.sm,
    paddingHorizontal: t.space[3],
    paddingVertical: t.space[1],
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
  }),
  md: (t) => ({
    minHeight: t.size.control.md,
    paddingHorizontal: t.space[4],
    paddingVertical: t.space[2],
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
  }),
  lg: (t) => ({
    minHeight: t.size.control.lg,
    paddingHorizontal: t.space[5],
    paddingVertical: t.space[3],
    fontSize: t.font.size.md,
    lineHeight: t.font.lineHeight.md,
  }),
} satisfies Record<ButtonSize, (t: Theme) => SizeStyle>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  hidden: { opacity: 0 },
  spinner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  onPress,
  accessibilityLabel,
  style,
  testID,
  ref,
  children,
}: ButtonNativeProps) {
  const t = useTheme();
  const { interactive, press } = useButton({ disabled, loading, onPress });
  const [focused, setFocused] = useState(false);

  const colors = variantStyles[variant](t);
  const dimensions = sizeStyles[size](t);
  const content: TextColorToken = disabled ? 'disabled' : colors.content;
  const iconSize = buttonIconSize[size];

  const container: ViewStyle = {
    minHeight: dimensions.minHeight,
    paddingHorizontal: dimensions.paddingHorizontal,
    paddingVertical: dimensions.paddingVertical,
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
  const label: TextStyle = {
    flexShrink: 1,
    fontSize: dimensions.fontSize,
    lineHeight: dimensions.lineHeight,
    fontWeight: t.font.weight.medium,
    color: t.color.text[content],
    textAlign: 'center',
  };
  const family = t.font.family.sans;
  if (family !== undefined) label.fontFamily = family;

  // El área táctil nunca baja de la altura del control por defecto (44 pt).
  const hitSlop = Math.max(0, (t.size.control.md - dimensions.minHeight) / 2);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
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
        fullWidth && styles.fullWidth,
        focused && focusRing,
        style,
      ]}
    >
      {/* Cargando: el contenido se oculta sin perder su sitio y el spinner se centra encima. */}
      <View style={[styles.content, { gap: t.space[2] }, loading && styles.hidden]}>
        {iconStart === undefined ? null : <Icon name={iconStart} size={iconSize} color={content} />}
        {renderLabel(children, label)}
        {iconEnd === undefined ? null : <Icon name={iconEnd} size={iconSize} color={content} />}
      </View>
      {loading ? (
        <View style={styles.spinner}>
          <Spinner size={iconSize} color={content} />
        </View>
      ) : null}
    </Pressable>
  );
}
