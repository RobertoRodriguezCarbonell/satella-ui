import {
  inputIconSize,
  useControllableState,
  useFormFieldControl,
  useTheme,
  type ControlSize,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fieldContainerStyle, fieldTextStyle } from '../_internal/field';
import { Icon } from '../icon/Icon';
import { ModalDialog } from '../modal/ModalDialog';
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
  option: { flexDirection: 'row', alignItems: 'center' },
  optionLabel: { flex: 1, minWidth: 0 },
});

/**
 * Un disparador con aspecto de `Input` que abre las opciones en una hoja inferior, la
 * misma de `Sheet` (ADR-042, ADR-040). React Native no trae ningún selector, y así
 * `Select` no añade dependencias.
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

  // El relleno de cada opción sobresale de la hoja lo mismo que mide: el texto queda
  // alineado con el título y el fondo al pulsarla, un poco más ancho.
  const optionPadding = t.space[3];

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

      <ModalDialog
        presentation="sheet"
        open={open}
        onClose={() => setOpen(false)}
        // El título es el nombre del campo: la etiqueta del `FormField` o la suya.
        title={control.accessibilityLabel ?? placeholder ?? ''}
        testID={testID === undefined ? undefined : `${testID}-list`}
      >
        <View accessibilityRole="radiogroup">
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
                    marginHorizontal: -optionPadding,
                    paddingHorizontal: optionPadding,
                    gap: t.space[3],
                    borderRadius: t.radius.sm,
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
        </View>
      </ModalDialog>
    </>
  );
}
