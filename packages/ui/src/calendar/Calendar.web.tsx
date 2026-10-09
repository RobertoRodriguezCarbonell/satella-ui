import {
  createCalendarFormatter,
  useCalendar,
  type CalendarDay,
  type CalendarDirection,
  type CalendarSize,
} from '@satellatickets/core';
import { useId, useLayoutEffect, useMemo, useRef, type KeyboardEvent } from 'react';

import { cx } from '../_internal/cx';
import { IconButton } from '../icon-button/IconButton';
import styles from './Calendar.module.css';
import type { CalendarWebProps } from './Calendar.types';

export type { CalendarWebProps } from './Calendar.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga aquí
// su clase.
const sizeClass = {
  sm: styles.sm,
  md: styles.md,
} satisfies Record<CalendarSize, string | undefined>;

// Las teclas del patrón de rejilla de fechas de ARIA.
function keyDirection(event: KeyboardEvent): CalendarDirection | undefined {
  switch (event.key) {
    case 'ArrowLeft':
      return 'previousDay';
    case 'ArrowRight':
      return 'nextDay';
    case 'ArrowUp':
      return 'previousWeek';
    case 'ArrowDown':
      return 'nextWeek';
    case 'Home':
      return 'weekStart';
    case 'End':
      return 'weekEnd';
    case 'PageUp':
      return event.shiftKey ? 'previousYear' : 'previousMonth';
    case 'PageDown':
      return event.shiftKey ? 'nextYear' : 'nextMonth';
    default:
      return undefined;
  }
}

/**
 * Un mes en una rejilla de fechas (ADR-046). Solo un día está en el orden de tabulación;
 * entre ellos se va con las flechas. Lo que hay que saber de cada día lo calcula
 * `useCalendar`, que es el mismo en la vista nativa.
 */
export function Calendar(props: CalendarWebProps) {
  const {
    locale,
    mode = 'single',
    size = 'md',
    previousMonthLabel,
    nextMonthLabel,
    markedLabel,
    accessibilityLabel,
    className,
    style,
    testID,
  } = props;
  const calendar = useCalendar(props);
  const format = useMemo(() => createCalendarFormatter(locale), [locale]);
  const titleId = useId();
  const grid = useRef<HTMLTableElement>(null);
  // El día al que el teclado acaba de llevar el foco. Puede estar en otro mes, que
  // todavía no se ha pintado: se enfoca cuando ya existe.
  const pendingFocus = useRef<string>(undefined);
  useLayoutEffect(() => {
    const date = pendingFocus.current;
    if (date === undefined) return;
    pendingFocus.current = undefined;
    grid.current?.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
  });

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    // Los atajos del navegador y del sistema no son para el calendario.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const direction = keyDirection(event);
    if (direction === undefined) return;
    event.preventDefault();
    pendingFocus.current = calendar.move(direction);
  }

  function label(day: CalendarDay): string {
    const text = format.dateLong(day.date);
    return day.marked && markedLabel !== undefined ? `${text}, ${markedLabel}` : text;
  }

  return (
    <div
      role="group"
      aria-label={accessibilityLabel}
      className={cx(styles.root, sizeClass[size], className)}
      style={style}
      data-testid={testID}
    >
      <div className={styles.header}>
        <IconButton
          icon="chevron-left"
          size="sm"
          label={previousMonthLabel}
          disabled={!calendar.canGoToPreviousMonth}
          onPress={calendar.goToPreviousMonth}
        />
        {/* Al cambiar de mes con los botones, el lector de pantalla dice cuál se ve. */}
        <span id={titleId} className={styles.title} aria-live="polite">
          {format.month(calendar.month)}
        </span>
        <IconButton
          icon="chevron-right"
          size="sm"
          label={nextMonthLabel}
          disabled={!calendar.canGoToNextMonth}
          onPress={calendar.goToNextMonth}
        />
      </div>
      <table
        ref={grid}
        role="grid"
        aria-labelledby={titleId}
        aria-multiselectable={mode === 'range' ? true : undefined}
        className={styles.grid}
        // Al salir el puntero, el periodo que se adelantaba deja de pintarse.
        onPointerLeave={() => calendar.preview(undefined)}
      >
        <thead>
          <tr>
            {calendar.weekdays.map((weekday) => (
              <th
                key={weekday}
                scope="col"
                abbr={format.weekdayLong(weekday)}
                className={styles.weekday}
              >
                {format.weekdayNarrow(weekday)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, column) =>
                day === null ? (
                  <td key={column} className={styles.cell} />
                ) : (
                  <td
                    key={day.date}
                    role="gridcell"
                    aria-selected={day.selected || day.inRange}
                    className={cx(
                      styles.cell,
                      day.inRange && styles.inRange,
                      day.rangeStart && styles.rangeStart,
                      day.rangeEnd && styles.rangeEnd,
                    )}
                  >
                    <button
                      type="button"
                      data-date={day.date}
                      // Solo uno en el orden de tabulación; entre ellos se va con las flechas.
                      tabIndex={day.tabbable ? 0 : -1}
                      aria-label={label(day)}
                      aria-current={day.today ? 'date' : undefined}
                      // `aria-disabled` y no `disabled`: un día que no se puede elegir sigue
                      // en el recorrido del teclado, para no dejar huecos en la rejilla.
                      aria-disabled={day.disabled ? true : undefined}
                      className={cx(
                        styles.day,
                        day.selected && styles.selected,
                        day.today && styles.today,
                      )}
                      onClick={(event) => {
                        // Safari no enfoca un botón al pulsarlo, y el teclado sigue desde el foco.
                        event.currentTarget.focus();
                        calendar.select(day.date);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        calendar.focus(day.date);
                        calendar.preview(day.date);
                      }}
                      onPointerEnter={() => calendar.preview(day.date)}
                    >
                      {day.day}
                      {day.marked ? <span className={styles.mark} aria-hidden="true" /> : null}
                    </button>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
