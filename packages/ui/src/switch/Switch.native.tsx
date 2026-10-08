import { useControllableState, useTheme } from '@satellatickets/core';
import { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { renderLabel } from '../_internal/label';
import type { SwitchNativeProps } from './Switch.types';

export type { SwitchNativeProps } from './Switch.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'flex-start' },
  track: { justifyContent: 'center', flexShrink: 0 },
  label: { flexShrink: 1 },
});

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
  ref,
  children,
}: SwitchNativeProps) {
  const t = useTheme();
  const [isChecked, setChecked] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const [focused, setFocused] = useState(false);
  const [progress] = useState(() => new Animated.Value(isChecked ? 1 : 0));

  const width = t.space[10];
  const height = t.space[6];
  const gap = t.borderWidth.thick;
  const thumb = height - gap * 2;
  const duration = t.duration.fast;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: isChecked ? 1 : 0,
      duration,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, isChecked, duration]);

  // El pulgar recorre lo que el carril tiene de más.
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, width - height] });

  const track: ViewStyle = {
    width,
    height,
    padding: gap,
    borderRadius: t.radius.full,
    // Apagado, el carril es `border.strong`: tiene que distinguirse del fondo con 3:1.
    backgroundColor: disabled
      ? t.color.action.disabled
      : isChecked
        ? t.color.action.primary
        : t.color.border.strong,
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
    lineHeight: t.font.lineHeight.md,
    color: disabled ? t.color.text.disabled : t.color.text.primary,
  };
  const family = t.font.family.sans;
  if (family !== undefined) label.fontFamily = family;

  // El área táctil nunca baja de la altura del control por defecto (44 pt).
  const hitSlop = Math.max(0, (t.size.control.md - height) / 2);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: isChecked, disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={() => setChecked(!isChecked)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={testID}
      style={[styles.root, { gap: t.space[3], minHeight: height }, style]}
    >
      <View style={[styles.track, track, focused && focusRing]}>
        <Animated.View
          style={{
            width: thumb,
            height: thumb,
            borderRadius: t.radius.full,
            backgroundColor: disabled ? t.color.text.disabled : t.color.text.onPrimary,
            transform: [{ translateX }],
          }}
        />
      </View>
      {children === undefined || children === null ? null : renderLabel(children, label)}
    </Pressable>
  );
}
