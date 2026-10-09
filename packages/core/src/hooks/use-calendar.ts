import { useState } from 'react';

import {
  addMonths,
  clampDate,
  getMonthWeeks,
  getWeekdays,
  isISODate,
  isISOMonth,
  shiftMonth,
  todayISO,
  toMonth,
} from '../calendar/dates';
import { getDateInDirection, type CalendarDirection } from '../calendar/navigation';
import { EMPTY_RANGE, getNextRange, isDateInRange } from '../calendar/range';
import type { CalendarMode, DateRange, Weekday } from '../types/calendar';
import { useControllableState } from './use-controllable-state';

/** Lo que `useCalendar` necesita del contrato de `Calendar`: todo menos los textos y el tamaño. */
export interface UseCalendarOptions {
  mode?: CalendarMode | undefined;
  value?: string | DateRange | undefined;
  defaultValue?: string | DateRange | undefined;
  onValueChange?: ((date: string) => void) | ((range: DateRange) => void) | undefined;
  month?: string | undefined;
  defaultMonth?: string | undefined;
  onMonthChange?: ((month: string) => void) | undefined;
  onDatePress?: ((date: string) => void) | undefined;
  min?: string | undefined;
  max?: string | undefined;
  isDateDisabled?: ((date: string) => boolean) | undefined;
  isDateMarked?: ((date: string) => boolean) | undefined;
  today?: string | undefined;
  weekStartsOn?: Weekday | undefined;
  disabled?: boolean | undefined;
}

/** Un día del mes que se ve, con todo lo que una vista necesita para pintarlo. */
export interface CalendarDay {
  /** La fecha ISO. */
  date: string;
  /** El número que se pinta. */
  day: number;
  /** Es la fecha elegida o, en un periodo, uno de sus extremos. */
  selected: boolean;
  /** Está dentro del periodo, extremos incluidos. Mientras falta el final, del que se adelanta. */
  inRange: boolean;
  /** Es el primer día del periodo. */
  rangeStart: boolean;
  /** Es el último día del periodo. */
  rangeEnd: boolean;
  today: boolean;
  /** No se puede elegir. */
  disabled: boolean;
  /** Lleva un punto. */
  marked: boolean;
  /** Es el único día del mes en el orden de tabulación (web). */
  tabbable: boolean;
}

export interface UseCalendarResult {
  /** El mes que se ve (`'2026-10'`). */
  month: string;
  /** Los días de la semana, en el orden de las columnas. */
  weekdays: Weekday[];
  /** Seis semanas de siete huecos: un día, o `null` donde el mes no llega. */
  weeks: (CalendarDay | null)[][];
  canGoToPreviousMonth: boolean;
  canGoToNextMonth: boolean;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  /** Elige una fecha. No hace nada si está deshabilitada. */
  select: (date: string) => void;
  /** Un día ha recibido el foco: pasa a ser el del orden de tabulación. */
  focus: (date: string) => void;
  /**
   * Mueve el foco con una tecla, cambiando de mes si hace falta, y devuelve la fecha a
   * la que ha ido para que la vista la enfoque.
   */
  move: (direction: CalendarDirection) => string;
  /**
   * El puntero o el foco están sobre una fecha (o sobre ninguna). En un periodo a medias
   * adelanta hasta dónde llegaría.
   */
  preview: (date: string | undefined) => void;
}

/** Los dos modos se tratan como un periodo: una fecha suelta empieza y acaba el mismo día. */
function toRange(mode: CalendarMode, value: string | DateRange): DateRange {
  if (mode === 'range') return typeof value === 'string' ? EMPTY_RANGE : value;
  const date = typeof value === 'string' ? value : '';
  return { start: date, end: date };
}

/**
 * La lógica de `Calendar`, común a web y nativo (ADR-046): qué mes se ve, qué días lo
 * forman y en qué estado está cada uno, y qué pasa al pulsar un día o una tecla. Las
 * vistas solo pintan lo que devuelve.
 */
export function useCalendar({
  mode = 'single',
  value,
  defaultValue,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  onDatePress,
  min,
  max,
  isDateDisabled,
  isDateMarked,
  today,
  weekStartsOn = 1,
  disabled = false,
}: UseCalendarOptions): UseCalendarResult {
  const [current, setCurrent] = useControllableState<string | DateRange>({
    value,
    defaultValue: defaultValue ?? (mode === 'range' ? EMPTY_RANGE : ''),
    // El contrato ata el tipo del aviso al modo; aquí dentro los dos van juntos.
    onChange: onValueChange as ((next: string | DateRange) => void) | undefined,
  });
  const range = toRange(mode, current);

  // "Hoy" se decide una vez: no cambia aunque el calendario siga abierto a medianoche.
  const [deviceToday] = useState(() => todayISO());
  const currentDay = isISODate(today) ? today : deviceToday;

  const [visibleMonth, setVisibleMonth] = useControllableState({
    value: isISOMonth(month) ? month : undefined,
    defaultValue: isISOMonth(defaultMonth)
      ? defaultMonth
      : toMonth(isISODate(range.start) ? range.start : clampDate(currentDay, min, max)),
    onChange: onMonthChange,
  });

  // El día que tiene el foco, o el último que lo tuvo.
  const [focused, setFocused] = useState<string>();
  const [previewed, setPreviewed] = useState<string>();

  function isDisabled(date: string): boolean {
    if (disabled) return true;
    if (isISODate(min) && date < min) return true;
    if (isISODate(max) && date > max) return true;
    return isDateDisabled?.(date) === true;
  }

  // El periodo que se pinta: el elegido o, mientras falta el final, el que se adelanta.
  const pending = mode === 'range' && range.start !== '' && range.end === '';
  const shown =
    pending && previewed !== undefined && !isDisabled(previewed)
      ? getNextRange(range, previewed)
      : range;

  const dates = getMonthWeeks(visibleMonth, weekStartsOn);
  const inMonth = (date: string | undefined): date is string =>
    date !== undefined && toMonth(date) === visibleMonth;
  // Solo un día está en el orden de tabulación: el que tenía el foco, el elegido, hoy o,
  // si ninguno está en este mes, el primero.
  const tabbable = clampDate(
    [focused, range.start, currentDay].find(inMonth) ?? `${visibleMonth}-01`,
    min,
    max,
  );

  const weeks = dates.map((week) =>
    week.map((date): CalendarDay | null => {
      if (date === null) return null;
      return {
        date,
        day: Number(date.slice(8)),
        selected: date === range.start || date === range.end,
        inRange: mode === 'range' && isDateInRange(date, shown),
        rangeStart: mode === 'range' && date === shown.start,
        rangeEnd: mode === 'range' && date === shown.end,
        today: date === currentDay,
        disabled: isDisabled(date),
        marked: isDateMarked?.(date) === true,
        tabbable: date === tabbable,
      };
    }),
  );

  const canGoToPreviousMonth = !disabled && !(isISODate(min) && toMonth(min) >= visibleMonth);
  const canGoToNextMonth = !disabled && !(isISODate(max) && toMonth(max) <= visibleMonth);

  function goToMonth(amount: number) {
    setVisibleMonth(shiftMonth(visibleMonth, amount));
    // El foco conserva su día del mes: al volver con el tabulador se sigue por donde se iba.
    setFocused(clampDate(addMonths(tabbable, amount), min, max));
    setPreviewed(undefined);
  }

  return {
    month: visibleMonth,
    weekdays: getWeekdays(weekStartsOn),
    weeks,
    canGoToPreviousMonth,
    canGoToNextMonth,
    goToPreviousMonth: () => {
      if (canGoToPreviousMonth) goToMonth(-1);
    },
    goToNextMonth: () => {
      if (canGoToNextMonth) goToMonth(1);
    },
    select: (date) => {
      if (isDisabled(date)) return;
      setCurrent(mode === 'range' ? getNextRange(range, date) : date);
      setFocused(date);
      setPreviewed(undefined);
      onDatePress?.(date);
    },
    focus: (date) => {
      setFocused(date);
    },
    move: (direction) => {
      const next = clampDate(getDateInDirection(tabbable, direction, weekStartsOn), min, max);
      setFocused(next);
      if (toMonth(next) !== visibleMonth) setVisibleMonth(toMonth(next));
      return next;
    },
    preview: (date) => {
      setPreviewed(date);
    },
  };
}
