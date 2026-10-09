import {
  createCalendarFormatter,
  inputIconSize,
  isISODate,
  useControllableState,
  useFormFieldControl,
  type ControlSize,
} from '@satellatickets/core';
import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { afterAnimations } from '../_internal/afterAnimations';
import { anchorPopover } from '../_internal/anchorPopover';
import { cx } from '../_internal/cx';
import field from '../_internal/field.module.css';
import { mergeRefs } from '../_internal/mergeRefs';
import { Calendar } from '../calendar/Calendar';
import { Icon } from '../icon/Icon';
import styles from './DatePicker.module.css';
import type { DatePickerWebProps } from './DatePicker.types';

export type { DatePickerWebProps } from './DatePicker.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga
// aquí su clase.
const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} satisfies Record<ControlSize, string | undefined>;

/**
 * Un campo con la fecha elegida que abre un `Calendar` (ADR-046). El calendario se pinta
 * en la capa superior del navegador, como la lista de `Select`, y mientras está abierto
 * tiene el foco: elegir un día, Escape, pulsar fuera o salir con el tabulador lo cierran.
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
  id,
  name,
  className,
  style,
  testID,
  ref,
}: DatePickerWebProps) {
  const control = useFormFieldControl({ id, invalid, disabled, required, accessibilityLabel });
  // La cadena vacía es "sin fecha" (ADR-037).
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const format = useMemo(() => createCalendarFormatter(locale), [locale]);
  const [opened, setOpened] = useState(false);
  // Cuántas veces se ha abierto. Cada apertura es un calendario nuevo, que empieza en el
  // mes y el día de la fecha elegida, aunque se reabra mientras el anterior aún se está yendo.
  const [session, setSession] = useState(0);
  const popupId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const setTrigger = useMemo(() => mergeRefs(trigger, ref), [ref]);

  // Si se deshabilita con el calendario abierto, queda cerrado: no reaparece al habilitarlo.
  if (opened && control.disabled) setOpened(false);
  const open = opened && !control.disabled;
  // Lo que hay en pantalla. Va por detrás de `open` al cerrar: el calendario sigue ahí,
  // sin poder usarse, mientras dura su salida (ADR-043).
  const [shown, setShown] = useState(false);
  if (open && !shown) setShown(true);
  const closing = shown && !open;
  const selected = isISODate(current) ? current : '';

  // Coloca el calendario bajo el campo, o encima si debajo no cabe, y le pasa el foco: a
  // partir de ahí el teclado es el de la rejilla de fechas.
  useLayoutEffect(() => {
    const anchor = root.current;
    const element = popup.current;
    if (!open || anchor === null || element === null) return;
    const release = anchorPopover(anchor, element, anchor, () => setOpened(false));
    element.querySelector<HTMLElement>('[data-date][tabindex="0"]')?.focus();
    return release;
  }, [open, session]);

  // La salida la anima el CSS con `data-closing`; al terminar, el calendario deja de existir.
  useLayoutEffect(() => {
    if (!closing || popup.current === null) return;
    return afterAnimations(popup.current, () => setShown(false));
  }, [closing]);

  function show() {
    setSession(session + 1);
    setOpened(true);
  }

  /** Cierra y devuelve el foco al campo, que es de donde salió. */
  function close() {
    setOpened(false);
    trigger.current?.focus();
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Safari no enfoca un botón al pulsarlo, y el cierre depende de dónde está el foco.
    event.currentTarget.focus();
    if (open) setOpened(false);
    else show();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    // Intro y Espacio ya lo abren, porque es un botón. La flecha, como en `Select`.
    if (event.key === 'ArrowDown' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      if (!open) show();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || !open) return;
    // Dentro de un `Modal`, Escape cierra el calendario y no el diálogo.
    event.preventDefault();
    event.stopPropagation();
    close();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    // El foco sale del campo y de su calendario: se cierra sin cambiar nada. Pulsar dentro
    // del calendario no lo saca, porque el propio calendario se puede enfocar.
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) setOpened(false);
  }

  return (
    // El teclado y el foco los atienden el botón y los días, que son los controles; la
    // caja solo se entera de lo que le llega de ellos.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={root}
      className={cx(
        field.field,
        styles.root,
        sizeClass[size],
        control.invalid && field.invalid,
        control.disabled && field.disabled,
        open && (control.invalid ? styles.openInvalid : styles.open),
        className,
      )}
      style={style}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={setTrigger}
        type="button"
        // Un combobox de solo selección cuyo desplegable es un diálogo: así su valor es
        // la fecha que muestra, y su nombre, la etiqueta del campo.
        role="combobox"
        id={control.id}
        className={cx(field.control, styles.trigger, selected === '' && styles.placeholder)}
        disabled={control.disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        aria-label={accessibilityLabel}
        aria-describedby={control.describedBy}
        aria-invalid={control.invalid ? true : undefined}
        // `aria-required` y no `required`: la librería no valida (ADR-037).
        aria-required={control.required ? true : undefined}
        data-testid={testID}
        // El foco lo mueve `handleClick`, no el navegador al bajar el botón del ratón. Con
        // el calendario abierto, Safari, que no enfoca los botones, dejaría el foco en
        // ningún sitio: se cerraría por perderlo y el clic lo volvería a abrir.
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {/* Sin fecha elegida, el texto visible es el placeholder. */}
        {selected === '' ? (placeholder ?? '') : format.dateMedium(selected)}
      </button>
      <span className={styles.icon} aria-hidden="true">
        <Icon
          name="calendar"
          size={inputIconSize[size]}
          color={control.disabled ? 'disabled' : 'muted'}
        />
      </span>
      {/* El calendario solo existe mientras está en pantalla. */}
      {shown ? (
        <div
          ref={popup}
          popover="manual"
          role="dialog"
          id={popupId}
          aria-label={control.accessibilityLabel}
          // Mientras se va ya no existe para el lector de pantalla.
          aria-hidden={closing ? true : undefined}
          data-closing={closing ? '' : undefined}
          // Enfocable, aunque fuera del orden de tabulación: al pulsar en un hueco, o en un
          // botón en Safari, que no los enfoca, el foco se queda aquí dentro. Si no, se
          // perdería, y con él Escape y el saber cuándo se sale del calendario.
          tabIndex={-1}
          className={styles.popup}
        >
          <Calendar
            key={session}
            size="sm"
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
            onDatePress={close}
          />
        </div>
      ) : null}
      {/* Con `name`, la fecha viaja en un `<form>` como el valor de cualquier campo. */}
      {name === undefined ? null : (
        <input type="hidden" name={name} value={selected} disabled={control.disabled} />
      )}
    </div>
  );
}
