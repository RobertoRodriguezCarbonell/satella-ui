import {
  createCalendarFormatter,
  useCalendar,
  useTheme,
  type CalendarDay,
  type CalendarSize,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { IconButton } from '../icon-button/IconButton';
import type { CalendarNativeProps } from './Calendar.types';

export type { CalendarNativeProps } from './Calendar.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga aquí
// su token. Cada día es un cuadrado del alto de un control.
const sizeStyles = {
  sm: (t) => t.size.control.sm,
  md: (t) => t.size.control.md,
} satisfies Record<CalendarSize, (t: Theme) => number>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  // Mide lo que sus siete columnas: no se estira con el contenedor.
  root: { alignSelf: 'flex-start' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, minWidth: 0, textAlign: 'center' },
  week: { flexDirection: 'row' },
  center: { alignItems: 'center', justifyContent: 'center' },
  mark: { position: 'absolute', alignSelf: 'center' },
});

interface DayButtonProps {
  day: CalendarDay;
  label: string;
  /** Lado del botón. */
  side: number;
  onPress: () => void;
}

/** Un día: un botón cuadrado con su número y, si está señalado, un punto debajo. */
function DayButton({ day, label, side, onPress }: DayButtonProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const color = day.disabled
    ? t.color.text.disabled
    : day.selected
      ? t.color.text.onPrimary
      : t.color.text.primary;
  const text: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    fontWeight: day.selected || day.today ? t.font.weight.semibold : t.font.weight.regular,
    color,
    // Cifras del mismo ancho: las columnas quedan alineadas.
    fontVariant: ['tabular-nums'],
  };
  const family = t.font.family.sans;
  if (family !== undefined) text.fontFamily = family;

  // Anillo de foco para teclado físico o mando, equivalente a `:focus-visible` en web.
  const focusRing: ViewStyle = {
    outlineStyle: 'solid',
    outlineColor: t.color.border.focus,
    outlineWidth: t.borderWidth.thick,
    outlineOffset: t.borderWidth.thick,
  };

  function background(pressed: boolean): string {
    if (day.selected) {
      if (day.disabled) return t.color.action.disabled;
      return pressed ? t.color.action.primaryActive : t.color.action.primary;
    }
    return pressed && !day.disabled ? t.color.bg.muted : 'transparent';
  }

  // Hoy lleva un contorno. Dentro de un periodo, con el color del acento: sobre el fondo
  // teñido, `border.strong` no llega al contraste de 3:1 en todas las marcas.
  function todayBorder(): string {
    if (day.disabled) return t.color.border.default;
    return day.inRange ? t.color.accent.text : t.color.border.strong;
  }
  const borderColor = day.today && !day.selected ? todayBorder() : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: day.selected || day.inRange, disabled: day.disabled }}
      disabled={day.disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.center,
        {
          width: side,
          height: side,
          borderWidth: t.borderWidth.thin,
          borderColor,
          borderRadius: t.radius.md,
          backgroundColor: background(pressed),
        },
        focused && focusRing,
      ]}
    >
      <Text style={text}>{day.day}</Text>
      {day.marked ? (
        <View
          style={[
            styles.mark,
            {
              bottom: t.space[1],
              width: t.space[1],
              height: t.space[1],
              borderRadius: t.radius.full,
              // Sobre el día elegido, el punto toma el color de su número.
              backgroundColor: day.selected || day.disabled ? color : t.color.accent.text,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

/**
 * Un mes en una rejilla de fechas (ADR-046): la misma que en web, hecha con vistas y un
 * botón por día. En nativo no hay teclado de flechas: cada día se pulsa. Lo que hay que
 * saber de cada uno lo calcula `useCalendar`.
 */
export function Calendar(props: CalendarNativeProps) {
  const {
    locale,
    size = 'md',
    previousMonthLabel,
    nextMonthLabel,
    markedLabel,
    accessibilityLabel,
    style,
    testID,
  } = props;
  const t = useTheme();
  const calendar = useCalendar(props);
  const format = useMemo(() => createCalendarFormatter(locale), [locale]);
  const side = sizeStyles[size](t);

  const title: TextStyle = {
    fontSize: t.font.size.md,
    lineHeight: t.font.lineHeight.md,
    fontWeight: t.font.weight.semibold,
    color: t.color.text.primary,
  };
  const weekday: TextStyle = {
    fontSize: t.font.size.xs,
    lineHeight: t.font.lineHeight.xs,
    fontWeight: t.font.weight.medium,
    color: t.color.text.muted,
  };
  const family = t.font.family.sans;
  if (family !== undefined) {
    title.fontFamily = family;
    weekday.fontFamily = family;
  }

  function label(day: CalendarDay): string {
    const text = format.dateLong(day.date);
    return day.marked && markedLabel !== undefined ? `${text}, ${markedLabel}` : text;
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, { width: side * 7 }, style]}
      testID={testID}
    >
      <View style={[styles.header, { gap: t.space[2], marginBottom: t.space[2] }]}>
        <IconButton
          icon="chevron-left"
          size="sm"
          label={previousMonthLabel}
          disabled={!calendar.canGoToPreviousMonth}
          onPress={calendar.goToPreviousMonth}
        />
        {/* Al cambiar de mes, el lector de pantalla dice cuál se ve. */}
        <Text style={[styles.title, title]} accessibilityLiveRegion="polite">
          {format.month(calendar.month)}
        </Text>
        <IconButton
          icon="chevron-right"
          size="sm"
          label={nextMonthLabel}
          disabled={!calendar.canGoToNextMonth}
          onPress={calendar.goToNextMonth}
        />
      </View>
      <View style={styles.week}>
        {calendar.weekdays.map((day) => (
          <View key={day} style={[styles.center, { width: side, height: t.size.control.sm }]}>
            {/* La inicial a la vista; el nombre entero para el lector de pantalla. */}
            <Text style={weekday} accessibilityLabel={format.weekdayLong(day)}>
              {format.weekdayNarrow(day)}
            </Text>
          </View>
        ))}
      </View>
      {calendar.weeks.map((week, weekIndex) => (
        // Entre semanas queda un hueco; entre días no, para que el fondo de un periodo
        // sea una franja continua.
        <View key={weekIndex} style={[styles.week, weekIndex > 0 && { marginTop: t.space[1] }]}>
          {week.map((day, column) =>
            day === null ? (
              <View key={column} style={{ width: side, height: side }} />
            ) : (
              <View
                key={day.date}
                style={[
                  { width: side, height: side },
                  // Un periodo: una franja teñida, redondeada donde empieza y acaba.
                  day.inRange && { backgroundColor: t.color.accent.bg },
                  day.rangeStart && {
                    borderTopLeftRadius: t.radius.md,
                    borderBottomLeftRadius: t.radius.md,
                  },
                  day.rangeEnd && {
                    borderTopRightRadius: t.radius.md,
                    borderBottomRightRadius: t.radius.md,
                  },
                ]}
              >
                <DayButton
                  day={day}
                  label={label(day)}
                  side={side}
                  onPress={() => calendar.select(day.date)}
                />
              </View>
            ),
          )}
        </View>
      ))}
    </View>
  );
}
