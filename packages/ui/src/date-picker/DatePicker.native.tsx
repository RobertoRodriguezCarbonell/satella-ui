import {
  createCalendarFormatter,
  inputIconSize,
  isISODate,
  useControllableState,
  useFormFieldControl,
  useTheme,
  type ControlSize,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { fieldContainerStyle, fieldTextStyle } from '../_internal/field';
import { Calendar } from '../calendar/Calendar';
import { Icon } from '../icon/Icon';
import { ModalDialog } from '../modal/ModalDialog';
import type { DatePickerNativeProps } from './DatePicker.types';

export type { DatePickerNativeProps } from './DatePicker.types';

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
  // Centrado en la hoja, que es más ancha que sus siete columnas.
  calendar: { alignSelf: 'center' },
});

/**
 * Un disparador con aspecto de `Input` que abre un `Calendar` en una hoja inferior, la
 * misma de `Sheet` (ADR-046, ADR-040), igual que `Select` abre sus opciones.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  locale,
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  isDateMarked,
  markedLabel,
  today,
  size = 'md',
  disabled,
  invalid,
  required,
  previousMonthLabel,
  nextMonthLabel,
  accessibilityLabel,
  style,
  testID,
  ref,
}: DatePickerNativeProps) {
  const t = useTheme();
  const control = useFormFieldControl({ invalid, disabled, required, accessibilityLabel });
  // La cadena vacía es "sin fecha" (ADR-037).
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const format = useMemo(() => createCalendarFormatter(locale), [locale]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const selected = isISODate(current) ? current : '';
  const shown = selected === '' ? (placeholder ?? '') : format.dateMedium(selected);

  return (
    <>
      <Pressable
        ref={ref}
        accessibilityRole="combobox"
        // La etiqueta del `FormField` es su nombre; la ayuda y el error, su pista.
        accessibilityLabel={control.accessibilityLabel}
        accessibilityHint={control.accessibilityHint}
        // El lector de pantalla dice la fecha con todas sus palabras, no la abreviada.
        accessibilityValue={{ text: selected === '' ? shown : format.dateLong(selected) }}
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
            fieldTextStyle(t, control.disabled),
            // Sin fecha elegida, el texto visible es el placeholder.
            selected === '' && !control.disabled && { color: t.color.text.muted },
          ]}
        >
          {shown}
        </Text>
        <Icon
          name="calendar"
          size={inputIconSize[size]}
          color={control.disabled ? 'disabled' : 'muted'}
        />
      </Pressable>

      <ModalDialog
        presentation="sheet"
        open={open}
        onClose={() => setOpen(false)}
        // El título es el nombre del campo: la etiqueta del `FormField` o la suya.
        title={control.accessibilityLabel ?? placeholder ?? ''}
        testID={testID === undefined ? undefined : `${testID}-calendar`}
      >
        <Calendar
          style={styles.calendar}
          locale={locale}
          weekStartsOn={weekStartsOn}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          isDateMarked={isDateMarked}
          markedLabel={markedLabel}
          today={today}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
          value={selected}
          onValueChange={setCurrent}
          // También al pulsar la fecha que ya estaba elegida: es la forma de confirmarla.
          onDatePress={() => setOpen(false)}
        />
      </ModalDialog>
    </>
  );
}
