import {
  inputIconSize,
  useFormFieldControl,
  useTheme,
  type ControlSize,
  type InputType,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fieldContainerStyle, fieldTextStyle } from '../_internal/field';
import { Icon } from '../icon/Icon';
import type { InputNativeProps } from './Input.types';

export type { InputNativeProps } from './Input.types';

type TypeProps = Pick<
  TextInputProps,
  | 'keyboardType'
  | 'secureTextEntry'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'autoComplete'
  | 'textContentType'
  | 'returnKeyType'
>;

// Mapas exhaustivos (ADR-014): un tipo o un tamaño nuevos en `core` no compilan hasta
// que tengan aquí su traducción.
const typeProps = {
  text: {},
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  password: {
    secureTextEntry: true,
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'current-password',
    textContentType: 'password',
  },
  search: { returnKeyType: 'search', autoCapitalize: 'none' },
  tel: { keyboardType: 'phone-pad', autoComplete: 'tel', textContentType: 'telephoneNumber' },
  url: {
    keyboardType: 'url',
    autoCapitalize: 'none',
    autoCorrect: false,
    autoComplete: 'url',
    textContentType: 'URL',
  },
  number: { keyboardType: 'decimal-pad' },
} satisfies Record<InputType, TypeProps>;

const paddingHorizontal = {
  sm: (t) => t.space[3],
  md: (t) => t.space[3],
  lg: (t) => t.space[4],
} satisfies Record<ControlSize, (t: Theme) => number>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  // Sin relleno propio: la altura la da la caja, y así el texto queda centrado en
  // iOS y en Android.
  input: { flex: 1, minWidth: 0, alignSelf: 'stretch', paddingVertical: 0, paddingHorizontal: 0 },
});

export function Input({
  value,
  defaultValue,
  onChangeText,
  placeholder,
  type = 'text',
  size = 'md',
  disabled,
  readOnly = false,
  invalid,
  required,
  iconStart,
  iconEnd,
  maxLength,
  onFocus,
  onBlur,
  onSubmit,
  accessibilityLabel,
  style,
  testID,
  ref,
}: InputNativeProps) {
  const t = useTheme();
  const control = useFormFieldControl({ invalid, disabled, required, accessibilityLabel });
  const [focused, setFocused] = useState(false);

  const iconSize = inputIconSize[size];
  const iconColor = control.disabled ? 'disabled' : 'muted';
  const translated: TypeProps = typeProps[type];

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
        {
          minHeight: t.size.control[size],
          paddingHorizontal: paddingHorizontal[size](t),
          gap: t.space[2],
        },
        style,
      ]}
    >
      {iconStart === undefined ? null : <Icon name={iconStart} size={iconSize} color={iconColor} />}
      <TextInput
        ref={ref}
        nativeID={control.id}
        style={[styles.input, fieldTextStyle(t, control.disabled)]}
        {...translated}
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
        onSubmitEditing={onSubmit}
      />
      {iconEnd === undefined ? null : <Icon name={iconEnd} size={iconSize} color={iconColor} />}
    </View>
  );
}
