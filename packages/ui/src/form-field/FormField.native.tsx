import { createFormFieldValue, FormFieldContext, useTheme } from '@satellatickets/core';
import { useId, useMemo } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { Icon } from '../icon/Icon';
import type { FormFieldNativeProps } from './FormField.types';

export type { FormFieldNativeProps } from './FormField.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  label: { alignSelf: 'flex-start' },
  error: { flexDirection: 'row', alignItems: 'flex-start' },
  errorIcon: { justifyContent: 'center' },
  errorText: { flex: 1 },
});

// La etiqueta y la ayuda ya llegan al lector de pantalla como nombre y pista del
// control (ADR-037): leerlas otra vez como texto suelto sería repetirlas.
const hiddenFromScreenReaders = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no',
} as const;

/**
 * Etiqueta, ayuda y error de un control (ADR-037). En nativo no hay `htmlFor`: el
 * control toma la etiqueta como nombre accesible y la ayuda y el error como pista.
 */
export function FormField({
  label,
  help,
  error,
  required = false,
  disabled = false,
  style,
  testID,
  children,
}: FormFieldNativeProps) {
  const t = useTheme();
  const baseId = useId();
  const field = useMemo(
    () => createFormFieldValue(baseId, { label, help, error, disabled, required }),
    [baseId, label, help, error, disabled, required],
  );

  const small: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
  };
  const family = t.font.family.sans;
  if (family !== undefined) small.fontFamily = family;

  return (
    <FormFieldContext.Provider value={field}>
      <View style={[styles.root, { gap: t.space[1] }, style]} testID={testID}>
        <Text
          style={[
            styles.label,
            small,
            {
              fontWeight: t.font.weight.medium,
              color: disabled ? t.color.text.disabled : t.color.text.primary,
            },
          ]}
          {...hiddenFromScreenReaders}
        >
          {label}
          {required ? <Text style={{ color: t.color.feedback.danger.text }}>{' *'}</Text> : null}
        </Text>
        {children}
        {field.help === undefined ? null : (
          <Text style={[small, { color: t.color.text.muted }]} {...hiddenFromScreenReaders}>
            {field.help}
          </Text>
        )}
        {field.error === undefined ? null : (
          // El error no depende solo del color: lleva su icono. En Android se anuncia al aparecer.
          <View style={[styles.error, { gap: t.space[1] }]} accessibilityLiveRegion="polite">
            <View style={[styles.errorIcon, { height: t.font.lineHeight.sm }]}>
              <Icon name="circle-alert" size="sm" color="danger" />
            </View>
            <Text style={[styles.errorText, small, { color: t.color.feedback.danger.text }]}>
              {field.error}
            </Text>
          </View>
        )}
      </View>
    </FormFieldContext.Provider>
  );
}
