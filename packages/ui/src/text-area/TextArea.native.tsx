import { useFormFieldControl, useTheme } from '@satellatickets/core';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { fieldContainerStyle, fieldTextStyle } from '../_internal/field';
import type { TextAreaNativeProps } from './TextArea.types';

export type { TextAreaNativeProps } from './TextArea.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  base: { alignSelf: 'stretch' },
  // El texto empieza arriba, como en un `<textarea>`; el relleno lo pone la caja.
  input: { paddingVertical: 0, paddingHorizontal: 0, textAlignVertical: 'top' },
});

export function TextArea({
  value,
  defaultValue,
  onChangeText,
  placeholder,
  rows = 3,
  disabled,
  readOnly = false,
  invalid,
  required,
  maxLength,
  onFocus,
  onBlur,
  accessibilityLabel,
  style,
  testID,
  ref,
}: TextAreaNativeProps) {
  const t = useTheme();
  const control = useFormFieldControl({ invalid, disabled, required, accessibilityLabel });
  const [focused, setFocused] = useState(false);
  const lineHeight = t.font.lineHeight.md;

  return (
    <View
      style={[
        styles.base,
        fieldContainerStyle(t, {
          focused,
          invalid: control.invalid,
          disabled: control.disabled,
          readOnly,
        }),
        { paddingVertical: t.space[2], paddingHorizontal: t.space[3] },
        style,
      ]}
    >
      <TextInput
        ref={ref}
        nativeID={control.id}
        multiline
        // `rows` fija la altura mínima; con más texto, el campo crece.
        style={[
          styles.input,
          fieldTextStyle(t, control.disabled),
          { lineHeight, minHeight: lineHeight * rows },
        ]}
        // Controlado si la app pasa `value`; si no, el campo guarda el texto (ADR-037).
        {...(value === undefined
          ? defaultValue === undefined
            ? {}
            : { defaultValue }
          : { value })}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.color.text.muted}
        selectionColor={t.color.border.focus}
        editable={!control.disabled && !readOnly}
        maxLength={maxLength}
        // La etiqueta del `FormField` es su nombre; la ayuda y el error, su pista.
        accessibilityLabel={control.accessibilityLabel}
        accessibilityHint={control.accessibilityHint}
        accessibilityState={{ disabled: control.disabled }}
        aria-required={control.required ? true : undefined}
        testID={testID}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
      />
    </View>
  );
}
