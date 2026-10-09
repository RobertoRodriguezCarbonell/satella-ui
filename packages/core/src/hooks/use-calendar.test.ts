import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DateRange } from '../types/calendar';
import { useCalendar, type UseCalendarOptions, type UseCalendarResult } from './use-calendar';

const TODAY = '2026-10-09';

function render(options: UseCalendarOptions = {}) {
  return renderHook((props: UseCalendarOptions) => useCalendar({ today: TODAY, ...props }), {
    initialProps: options,
  });
}

function day(result: { current: UseCalendarResult }, date: string) {
  const found = result.current.weeks.flat().find((cell) => cell?.date === date);
  if (found === undefined || found === null) throw new Error(`${date} no está en el mes que se ve`);
  return found;
}

/** Las fechas del mes que cumplen una condición. */
function dates(
  result: { current: UseCalendarResult },
  key: 'selected' | 'inRange' | 'disabled' | 'marked' | 'tabbable' | 'today',
) {
  return result.current.weeks
    .flat()
    .filter((cell) => cell !== null && cell[key])
    .map((cell) => cell?.date);
}

describe('useCalendar: el mes que se ve', () => {
  it('sin fecha elegida empieza en el mes de hoy', () => {
    const { result } = render();
    expect(result.current.month).toBe('2026-10');
    expect(result.current.weeks).toHaveLength(6);
    expect(dates(result, 'today')).toEqual([TODAY]);
    expect(day(result, '2026-10-31').day).toBe(31);
  });

  it('con una fecha elegida empieza en su mes', () => {
    expect(render({ defaultValue: '2027-03-15' }).result.current.month).toBe('2027-03');
    expect(
      render({ mode: 'range', defaultValue: { start: '2027-05-02', end: '2027-06-01' } }).result
        .current.month,
    ).toBe('2027-05');
  });

  it('defaultMonth manda sobre la fecha elegida', () => {
    expect(
      render({ defaultValue: '2027-03-15', defaultMonth: '2026-01' }).result.current.month,
    ).toBe('2026-01');
  });

  it('si hoy queda fuera de los límites, empieza en el mes del límite', () => {
    expect(render({ min: '2026-12-10' }).result.current.month).toBe('2026-12');
    expect(render({ max: '2026-03-10' }).result.current.month).toBe('2026-03');
  });

  it('sin today usa el día del dispositivo', () => {
    const { result } = renderHook(() => useCalendar({}));
    expect(dates(result, 'today')).toHaveLength(1);
  });

  it('los botones cambian de mes y avisan', () => {
    const onMonthChange = vi.fn();
    const { result } = render({ onMonthChange });

    act(() => result.current.goToNextMonth());
    expect(result.current.month).toBe('2026-11');
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-11');

    act(() => result.current.goToPreviousMonth());
    act(() => result.current.goToPreviousMonth());
    expect(result.current.month).toBe('2026-09');
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-09');
  });

  it('controlado, espera a que la app le pase el mes nuevo', () => {
    const onMonthChange = vi.fn();
    const { result, rerender } = render({ month: '2026-10', onMonthChange });

    act(() => result.current.goToNextMonth());
    expect(onMonthChange).toHaveBeenCalledExactlyOnceWith('2026-11');
    expect(result.current.month).toBe('2026-10');

    rerender({ month: '2026-11', onMonthChange });
    expect(result.current.month).toBe('2026-11');
  });

  it('un month que no es un mes se ignora', () => {
    expect(render({ month: 'octubre' }).result.current.month).toBe('2026-10');
    expect(render({ defaultMonth: '2026-13' }).result.current.month).toBe('2026-10');
  });

  it('no se puede salir de los meses que tienen fechas elegibles', () => {
    const { result } = render({ min: '2026-10-05', max: '2026-11-20' });
    expect(result.current.canGoToPreviousMonth).toBe(false);
    expect(result.current.canGoToNextMonth).toBe(true);
    act(() => result.current.goToPreviousMonth());
    expect(result.current.month).toBe('2026-10');

    act(() => result.current.goToNextMonth());
    expect(result.current.canGoToPreviousMonth).toBe(true);
    expect(result.current.canGoToNextMonth).toBe(false);
    act(() => result.current.goToNextMonth());
    expect(result.current.month).toBe('2026-11');
  });

  it('las columnas siguen el primer día de la semana', () => {
    expect(render().result.current.weekdays).toEqual([1, 2, 3, 4, 5, 6, 0]);
    const sunday = render({ weekStartsOn: 0 }).result.current;
    expect(sunday.weekdays[0]).toBe(0);
    // El 1 de octubre de 2026 es jueves: quinta columna con la semana en domingo.
    expect(sunday.weeks[0]?.[4]?.date).toBe('2026-10-01');
  });
});

describe('useCalendar: una fecha', () => {
  it('elegir una fecha la marca y avisa', () => {
    const onValueChange = vi.fn<(date: string) => void>();
    const { result } = render({ onValueChange });
    expect(dates(result, 'selected')).toEqual([]);

    act(() => result.current.select('2026-10-15'));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-10-15');
    expect(dates(result, 'selected')).toEqual(['2026-10-15']);
    // Una fecha suelta no es un periodo.
    expect(dates(result, 'inRange')).toEqual([]);
    expect(day(result, '2026-10-15').rangeStart).toBe(false);
  });

  it('controlado, espera a que la app le pase la fecha nueva', () => {
    const onValueChange = vi.fn<(date: string) => void>();
    const { result, rerender } = render({ value: '2026-10-12', onValueChange });

    act(() => result.current.select('2026-10-15'));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('2026-10-15');
    expect(dates(result, 'selected')).toEqual(['2026-10-12']);

    rerender({ value: '2026-10-15', onValueChange });
    expect(dates(result, 'selected')).toEqual(['2026-10-15']);
  });

  it('onDatePress avisa de cada pulsación sobre un día elegible, cambie o no la fecha', () => {
    const onValueChange = vi.fn<(date: string) => void>();
    const onDatePress = vi.fn();
    const { result } = render({
      defaultValue: '2026-10-15',
      max: '2026-10-20',
      onValueChange,
      onDatePress,
    });

    act(() => result.current.select('2026-10-15'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onDatePress).toHaveBeenCalledExactlyOnceWith('2026-10-15');

    // Sobre un día deshabilitado no hay pulsación que valga.
    act(() => result.current.select('2026-10-25'));
    expect(onDatePress).toHaveBeenCalledTimes(1);
  });

  it('elegir la misma fecha no avisa', () => {
    const onValueChange = vi.fn<(date: string) => void>();
    const { result } = render({ defaultValue: '2026-10-15', onValueChange });
    act(() => result.current.select('2026-10-15'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('un valor de periodo en modo de una fecha se trata como sin fecha', () => {
    const { result } = render({ defaultValue: { start: '2026-10-12', end: '2026-10-15' } });
    expect(dates(result, 'selected')).toEqual([]);
  });
});

describe('useCalendar: un periodo', () => {
  it('la primera pulsación fija el inicio y la segunda el final', () => {
    const onValueChange = vi.fn<(range: DateRange) => void>();
    const { result } = render({ mode: 'range', onValueChange });

    act(() => result.current.select('2026-10-12'));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-12', end: '' });
    expect(dates(result, 'selected')).toEqual(['2026-10-12']);
    expect(dates(result, 'inRange')).toEqual([]);

    act(() => result.current.select('2026-10-15'));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-12', end: '2026-10-15' });
    expect(dates(result, 'selected')).toEqual(['2026-10-12', '2026-10-15']);
    expect(dates(result, 'inRange')).toEqual([
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
    ]);
    expect(day(result, '2026-10-12')).toMatchObject({ rangeStart: true, rangeEnd: false });
    expect(day(result, '2026-10-15')).toMatchObject({ rangeStart: false, rangeEnd: true });
  });

  it('si la segunda fecha es anterior, el periodo queda ordenado', () => {
    const onValueChange = vi.fn<(range: DateRange) => void>();
    const { result } = render({ mode: 'range', onValueChange });
    act(() => result.current.select('2026-10-15'));
    act(() => result.current.select('2026-10-12'));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-12', end: '2026-10-15' });
  });

  it('con el periodo completo, la siguiente pulsación empieza otro', () => {
    const { result } = render({
      mode: 'range',
      defaultValue: { start: '2026-10-12', end: '2026-10-15' },
    });
    act(() => result.current.select('2026-10-20'));
    expect(dates(result, 'selected')).toEqual(['2026-10-20']);
    expect(dates(result, 'inRange')).toEqual([]);
  });

  it('mientras falta el final, adelanta el periodo hasta la fecha que se señala', () => {
    const { result } = render({ mode: 'range' });
    act(() => result.current.select('2026-10-12'));

    act(() => result.current.preview('2026-10-14'));
    expect(dates(result, 'inRange')).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
    expect(day(result, '2026-10-14').rangeEnd).toBe(true);
    // Lo elegido sigue siendo solo el inicio.
    expect(dates(result, 'selected')).toEqual(['2026-10-12']);

    // Hacia atrás, el inicio pasa a ser el final.
    act(() => result.current.preview('2026-10-10'));
    expect(dates(result, 'inRange')).toEqual(['2026-10-10', '2026-10-11', '2026-10-12']);
    expect(day(result, '2026-10-10').rangeStart).toBe(true);

    act(() => result.current.preview(undefined));
    expect(dates(result, 'inRange')).toEqual([]);
  });

  it('no adelanta nada sin inicio, con el periodo completo o sobre un día deshabilitado', () => {
    const empty = render({ mode: 'range' }).result;
    act(() => empty.current.preview('2026-10-14'));
    expect(dates(empty, 'inRange')).toEqual([]);

    const complete = render({
      mode: 'range',
      defaultValue: { start: '2026-10-12', end: '2026-10-13' },
    }).result;
    act(() => complete.current.preview('2026-10-20'));
    expect(dates(complete, 'inRange')).toEqual(['2026-10-12', '2026-10-13']);

    const limited = render({ mode: 'range', max: '2026-10-13' }).result;
    act(() => limited.current.select('2026-10-12'));
    act(() => limited.current.preview('2026-10-20'));
    expect(dates(limited, 'inRange')).toEqual([]);
  });

  it('un valor de una fecha en modo de periodo se trata como sin periodo', () => {
    const { result } = render({ mode: 'range', defaultValue: '2026-10-12' });
    expect(dates(result, 'selected')).toEqual([]);
  });
});

describe('useCalendar: días que no se pueden elegir', () => {
  it('deshabilita lo que queda fuera de min y max', () => {
    const { result } = render({ min: '2026-10-05', max: '2026-10-07' });
    expect(
      result.current.weeks.flat().filter((cell) => cell !== null && !cell.disabled),
    ).toHaveLength(3);
    expect(day(result, '2026-10-04').disabled).toBe(true);
    expect(day(result, '2026-10-05').disabled).toBe(false);
    expect(day(result, '2026-10-08').disabled).toBe(true);
  });

  it('deshabilita los días que diga la app', () => {
    const { result } = render({ isDateDisabled: (date) => date.endsWith('-13') });
    expect(dates(result, 'disabled')).toEqual(['2026-10-13']);
  });

  it('un día deshabilitado no se puede elegir', () => {
    const onValueChange = vi.fn<(date: string) => void>();
    const { result } = render({ max: '2026-10-10', onValueChange });
    act(() => result.current.select('2026-10-11'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(dates(result, 'selected')).toEqual([]);
  });

  it('deshabilitado entero, no se elige nada ni se cambia de mes', () => {
    const onValueChange = vi.fn<(date: string) => void>();
    const { result } = render({ disabled: true, onValueChange });
    expect(dates(result, 'disabled')).toHaveLength(31);
    expect(result.current.canGoToPreviousMonth).toBe(false);
    expect(result.current.canGoToNextMonth).toBe(false);

    act(() => result.current.select('2026-10-15'));
    act(() => result.current.goToNextMonth());

    expect(onValueChange).not.toHaveBeenCalled();
    expect(result.current.month).toBe('2026-10');
  });

  it('señala los días que diga la app', () => {
    const { result } = render({ isDateMarked: (date) => date === '2026-10-17' });
    expect(dates(result, 'marked')).toEqual(['2026-10-17']);
  });
});

describe('useCalendar: el foco', () => {
  it('solo un día está en el orden de tabulación: el elegido, o si no, hoy', () => {
    expect(dates(render().result, 'tabbable')).toEqual([TODAY]);
    expect(dates(render({ defaultValue: '2026-10-20' }).result, 'tabbable')).toEqual([
      '2026-10-20',
    ]);
  });

  it('en un mes sin fecha elegida ni hoy, es el día 1', () => {
    expect(dates(render({ defaultMonth: '2027-02' }).result, 'tabbable')).toEqual(['2027-02-01']);
  });

  it('nunca queda fuera de los límites', () => {
    const { result } = render({ defaultMonth: '2026-10', min: '2026-10-20' });
    expect(dates(result, 'tabbable')).toEqual(['2026-10-20']);
  });

  it('las teclas mueven el foco y devuelven la fecha a enfocar', () => {
    const { result } = render();
    let target = '';
    act(() => {
      target = result.current.move('nextDay');
    });
    expect(target).toBe('2026-10-10');
    expect(dates(result, 'tabbable')).toEqual(['2026-10-10']);

    act(() => {
      target = result.current.move('nextWeek');
    });
    expect(target).toBe('2026-10-17');
    act(() => {
      target = result.current.move('weekStart');
    });
    expect(target).toBe('2026-10-12');
  });

  it('al salir del mes con el teclado, cambia de mes y avisa', () => {
    const onMonthChange = vi.fn();
    const { result } = render({ defaultValue: '2026-10-30', onMonthChange });
    act(() => {
      result.current.move('nextWeek');
    });
    expect(result.current.month).toBe('2026-11');
    expect(onMonthChange).toHaveBeenCalledExactlyOnceWith('2026-11');
    expect(dates(result, 'tabbable')).toEqual(['2026-11-06']);

    act(() => {
      result.current.move('previousYear');
    });
    expect(result.current.month).toBe('2025-11');
  });

  it('el teclado no pasa de los límites', () => {
    const { result } = render({ min: '2026-10-08', max: '2026-10-10' });
    let target = '';
    act(() => {
      target = result.current.move('previousWeek');
    });
    expect(target).toBe('2026-10-08');
    act(() => {
      target = result.current.move('nextMonth');
    });
    expect(target).toBe('2026-10-10');
    expect(result.current.month).toBe('2026-10');
  });

  it('el día que recibe el foco pasa a ser el del orden de tabulación', () => {
    const { result } = render();
    act(() => result.current.focus('2026-10-22'));
    expect(dates(result, 'tabbable')).toEqual(['2026-10-22']);
  });

  it('al cambiar de mes con los botones conserva el día del mes', () => {
    const { result } = render({ defaultValue: '2026-10-31' });
    act(() => result.current.goToNextMonth());
    // Noviembre tiene 30 días.
    expect(dates(result, 'tabbable')).toEqual(['2026-11-30']);
  });

  it('elegir una fecha le da el foco', () => {
    const { result } = render();
    act(() => result.current.select('2026-10-21'));
    expect(dates(result, 'tabbable')).toEqual(['2026-10-21']);
  });
});
