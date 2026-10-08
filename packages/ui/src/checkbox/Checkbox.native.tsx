import { useControllableState, useTheme } from '@satellatickets/core';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';

import { renderLabel } from '../_internal/label';
import { Icon } from '../icon/Icon';
import type { CheckboxNativeProps } from './Checkbox.types';

export type { CheckboxNativeProps } from './Checkbox.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start' },
  box: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { flexShrink: 1 },
});

export function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  invalid = false,
  accessibilityLabel,
  style,
  testID,
  ref,
  children,
}: CheckboxNativeProps) {
  const t = useTheme();
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const [focused, setFocused] = useState(false);

  // Marcada o indeterminada: la caja se rellena con el color de la acción principal.
  const filled = isChecked || indeterminate;
  const size = t.space[5];
  const lineHeight = t.font.lineHeight.md;

  const box: ViewStyle = {
    width: size,
    height: size,
    // Centra la caja con la primera línea del texto.
    marginTop: (lineHeight - size) / 2,
    borderRadius: t.radius.xs,
    borderWidth: t.borderWidth.thin,
    // El contorno tiene que distinguirse del fondo con un contraste de 3:1.
    borderColor: disabled
      ? 'transparent'
      : filled
        ? t.color.action.primary
        : invalid
          ? t.color.feedback.danger.icon
          : t.color.border.strong,
    backgroundColor: disabled
      ? t.color.action.disabled
      : filled
        ? t.color.action.primary
        : t.color.bg.surface,
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
    fontSize: t.font.size.md,
    lineHeight,
    color: disabled ? t.color.text.disabled : t.color.text.primary,
  };
  const family = t.font.family.sans;
  if (family !== undefined) label.fontFamily = family;

  const mark = disabled ? 'disabled' : 'onPrimary';
  const minHeight = t.space[6];
  // El área táctil nunca baja de la altura del control por defecto (44 pt).
  const hitSlop = Math.max(0, (t.size.control.md - minHeight) / 2);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: indeterminate ? 'mixed' : isChecked, disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={() => setChecked(!isChecked)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={testID}
      style={[styles.root, { gap: t.space[2], minHeight }, style]}
    >
      <View style={[styles.box, box, focused && focusRing]}>
        {indeterminate ? (
          <Icon name="minus" size="sm" color={mark} />
        ) : isChecked ? (
          <Icon name="check" size="sm" color={mark} />
        ) : null}
      </View>
      {children === undefined || children === null ? null : renderLabel(children, label)}
    </Pressable>
  );
}
