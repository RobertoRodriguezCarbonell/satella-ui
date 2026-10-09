/**
 * Tamaños de `Calendar` (ADR-009): cada día es un cuadrado del alto de un control de
 * ese tamaño. `md`, el de por defecto, da un área táctil cómoda; `sm` es para un
 * calendario que se abre sobre un formulario en un escritorio.
 */
export const calendarSizes = ['sm', 'md'] as const;
export type CalendarSize = (typeof calendarSizes)[number];

/** Qué se elige: una fecha o un periodo. */
export const calendarModes = ['single', 'range'] as const;
export type CalendarMode = (typeof calendarModes)[number];

/** Días de la semana como los numera JavaScript: 0 es domingo y 6, sábado. */
export const weekdays = [0, 1, 2, 3, 4, 5, 6] as const;
export type Weekday = (typeof weekdays)[number];

/**
 * Un periodo entre dos fechas, las dos incluidas (ADR-046). Cada una es un texto ISO
 * (`'2026-10-09'`) o la cadena vacía si todavía no se ha elegido.
 */
export interface DateRange {
  start: string;
  end: string;
}

interface CalendarBaseProps {
  /**
   * Idioma de los nombres de los meses y de los días (`'es'`, `'en-GB'`). Es obligatorio:
   * un valor tomado del entorno podría no coincidir entre el servidor y el navegador.
   */
  locale: string;
  /** Primer día de la semana: 0 es domingo. Por defecto 1, lunes. */
  weekStartsOn?: Weekday | undefined;
  /** Mes que se ve (`'2026-10'`), controlado por la app. Sin él, guarda su estado (ADR-037). */
  month?: string | undefined;
  /** Mes inicial cuando guarda su propio estado. Por defecto, el de la fecha elegida o el de hoy. */
  defaultMonth?: string | undefined;
  /** Se llama con el mes al que se cambia, por ejemplo para pedir sus datos. */
  onMonthChange?: ((month: string) => void) | undefined;
  /**
   * Se llama al pulsar un día que se puede elegir, cambie o no lo elegido. Sirve para
   * cerrar lo que contiene al calendario: `onValueChange` no avisa si se pulsa la fecha
   * que ya estaba elegida.
   */
  onDatePress?: ((date: string) => void) | undefined;
  /** Primera fecha que se puede elegir. */
  min?: string | undefined;
  /** Última fecha que se puede elegir. */
  max?: string | undefined;
  /** Días sueltos que no se pueden elegir, por ejemplo los que ya no tienen entradas. */
  isDateDisabled?: ((date: string) => boolean) | undefined;
  /** Días que se señalan con un punto: los que tienen eventos, ventas… */
  isDateMarked?: ((date: string) => boolean) | undefined;
  /**
   * Lo que el lector de pantalla añade al nombre de un día señalado ("con eventos").
   * Sin él, el punto es solo visual.
   */
  markedLabel?: string | undefined;
  /**
   * El día que se destaca como hoy. Por defecto, el del dispositivo. En una app que se
   * renderiza en el servidor conviene pasarlo, para que servidor y navegador coincidan.
   */
  today?: string | undefined;
  size?: CalendarSize | undefined;
  /** No se puede elegir ninguna fecha ni cambiar de mes. */
  disabled?: boolean | undefined;
  /** Nombre accesible del botón del mes anterior ("Mes anterior"). */
  previousMonthLabel: string;
  /** Nombre accesible del botón del mes siguiente ("Mes siguiente"). */
  nextMonthLabel: string;
  /** Nombre accesible del calendario ("Fecha del evento"). */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}

interface CalendarSingleProps extends CalendarBaseProps {
  /** Por defecto `single`: se elige una fecha. */
  mode?: 'single' | undefined;
  /** Fecha elegida (`'2026-10-09'`), controlada por la app; la cadena vacía es ninguna. */
  value?: string | undefined;
  /** Fecha inicial cuando guarda su propio estado. */
  defaultValue?: string | undefined;
  /** Se llama con la fecha elegida. */
  onValueChange?: ((date: string) => void) | undefined;
}

interface CalendarRangeProps extends CalendarBaseProps {
  /** Se elige un periodo: una pulsación fija el inicio y la siguiente, el final. */
  mode: 'range';
  /** Periodo elegido, controlado por la app. */
  value?: DateRange | undefined;
  /** Periodo inicial cuando guarda su propio estado. */
  defaultValue?: DateRange | undefined;
  /**
   * Se llama en cada pulsación: tras la primera, con el inicio y `end` vacío; tras la
   * segunda, con el periodo completo y ordenado.
   */
  onValueChange?: ((range: DateRange) => void) | undefined;
}

/**
 * Contrato de `Calendar`: un mes en el que se elige una fecha o un periodo (ADR-046).
 * Las fechas son textos ISO, sin hora ni zona horaria.
 */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;
