import type { Weekday } from './calendar';
import type { ControlSize } from './control';

/**
 * Contrato de `DatePicker`: un campo que muestra una fecha y abre un `Calendar` para
 * elegirla (ADR-046). La fecha es un texto ISO (`'2026-10-09'`), sin hora ni zona horaria.
 */
export interface DatePickerProps {
  /** Fecha elegida, controlada por la app; la cadena vacía es ninguna (ADR-037). */
  value?: string | undefined;
  /** Fecha inicial cuando guarda su propio estado. */
  defaultValue?: string | undefined;
  /** Se llama con la fecha elegida. */
  onValueChange?: ((date: string) => void) | undefined;
  /** Texto que se muestra mientras no hay ninguna fecha elegida. */
  placeholder?: string | undefined;
  /**
   * Idioma en que se escribe la fecha y de los nombres del calendario (`'es'`, `'en-GB'`).
   * Es obligatorio: un valor tomado del entorno podría no coincidir entre el servidor y
   * el navegador.
   */
  locale: string;
  /** Primer día de la semana: 0 es domingo. Por defecto 1, lunes. */
  weekStartsOn?: Weekday | undefined;
  /** Primera fecha que se puede elegir. */
  min?: string | undefined;
  /** Última fecha que se puede elegir. */
  max?: string | undefined;
  /** Días sueltos que no se pueden elegir. */
  isDateDisabled?: ((date: string) => boolean) | undefined;
  /** Días que se señalan con un punto en el calendario. */
  isDateMarked?: ((date: string) => boolean) | undefined;
  /** Lo que el lector de pantalla añade al nombre de un día señalado ("con eventos"). */
  markedLabel?: string | undefined;
  /** El día que se destaca como hoy. Por defecto, el del dispositivo. */
  today?: string | undefined;
  size?: ControlSize | undefined;
  /** No se puede abrir ni enfocar. */
  disabled?: boolean | undefined;
  /** La fecha no es válida. Dentro de un `FormField` con `error` se activa solo. */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** Nombre accesible del botón del mes anterior ("Mes anterior"). */
  previousMonthLabel: string;
  /** Nombre accesible del botón del mes siguiente ("Mes siguiente"). */
  nextMonthLabel: string;
  /** Nombre accesible cuando no hay un `FormField` que lo etiquete. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
