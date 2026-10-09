import {
  inputIconSize,
  useControllableState,
  useFormFieldControl,
  useTheme,
  type ControlSize,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { fieldContainerStyle, fieldTextStyle } from '../_internal/field';
import { Icon } from '../icon/Icon';
import type { SelectNativeProps } from './Select.types';

export type { SelectNativeProps } from './Select.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga
// aquí su relleno.
const paddingHorizontal = {
  sm: (t) => t.space[3],
  md: (t) => t.space[3],
  lg: (t) => t.space[4],
} satisfies Record<ControlSize, (t: Theme) => number>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  value: { flex: 1, minWidth: 0 },
  overlay: { flex: 1, justifyContent: 'center' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  list: { alignSelf: 'stretch', maxHeight: '70%', overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { flex: 1, minWidth: 0 },
});

/**
 * Un disparador con aspecto de `Input` que abre una lista modal (ADR-042). React
 * Native no trae ningún selector, y así `Select` no añade dependencias.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  disabled,
  invalid,
  required,
  accessibilityLabel,
  style,
  testID,
  ref,
}: SelectNativeProps) {
  const t = useTheme();
  const control = useFormFieldControl({ invalid, disabled, required, accessibilityLabel });
  // La cadena vacía es "sin elegir" (ADR-037).
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const selected = options.find((option) => option.value === current);
  const iconSize = inputIconSize[size];
  const text = fieldTextStyle(t, control.disabled);

  const list: ViewStyle = {
    borderRadius: t.radius.lg,
    borderWidth: t.borderWidth.thin,
    borderColor: t.color.border.default,
    backgroundColor: t.color.bg.elevated,
    paddingVertical: t.space[2],
  };
  const title: TextStyle = {
    paddingHorizontal: t.space[4],
    paddingVertical: t.space[2],
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    fontWeight: t.font.weight.medium,
    color: t.color.text.muted,
  };
  const family = t.font.family.sans;
  if (family !== undefined) title.fontFamily = family;

  function choose(next: string) {
    setCurrent(next);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        ref={ref}
        accessibilityRole="combobox"
        // La etiqueta del `FormField` es su nombre; la ayuda y el error, su pista.
        accessibilityLabel={control.accessibilityLabel}
        accessibilityHint={control.accessibilityHint}
        accessibilityValue={{ text: selected?.label ?? placeholder ?? '' }}
        accessibilityState={{ disabled: control.disabled, expanded: open }}
        aria-required={control.required ? true : undefined}
        disabled={control.disabled}
        onPress={() => setOpen(true)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        testID={testID}
        style={[
          styles.trigger,
          fieldContainerStyle(t, {
            focused: focused || open,
            invalid: control.invalid,
            disabled: control.disabled,
            readOnly: false,
          }),
          {
            minHeight: t.size.control[size],
            paddingHorizontal: paddingHorizontal[size](t),
            gap: t.space[2],
          },
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            text,
            // Sin opción elegida, el texto visible es el placeholder.
            selected === undefined && !control.disabled && { color: t.color.text.muted },
          ]}
        >
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Icon name="chevron-down" size={iconSize} color={control.disabled ? 'disabled' : 'muted'} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        // El botón atrás de Android cierra la lista sin elegir.
        onRequestClose={() => setOpen(false)}
        testID={testID === undefined ? undefined : `${testID}-modal`}
      >
        <View
          style={[styles.overlay, { padding: t.space[6], backgroundColor: t.color.bg.overlay }]}
        >
          {/* Tocar fuera de la lista la cierra sin elegir. Para los lectores de pantalla no es un control. */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
            accessible={false}
            importantForAccessibility="no"
            testID={testID === undefined ? undefined : `${testID}-backdrop`}
          />
          <View style={[styles.list, list]}>
            {control.accessibilityLabel === undefined ? null : (
              <Text style={title} accessibilityRole="header">
                {control.accessibilityLabel}
              </Text>
            )}
            <ScrollView accessibilityRole="radiogroup">
              {options.map((option) => {
                const isSelected = option.value === current;
                const isDisabled = option.disabled === true;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                    disabled={isDisabled}
                    onPress={() => choose(option.value)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        minHeight: t.size.control.md,
                        paddingHorizontal: t.space[4],
                        gap: t.space[3],
                        backgroundColor: pressed ? t.color.bg.muted : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.optionLabel, fieldTextStyle(t, isDisabled)]}>
                      {option.label}
                    </Text>
                    {isSelected ? <Icon name="check" size="md" color="link" /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
