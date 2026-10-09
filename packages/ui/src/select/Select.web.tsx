import {
  findOptionByText,
  getOptionInDirection,
  inputIconSize,
  useControllableState,
  useFormFieldControl,
  type ControlSize,
  type OptionDirection,
} from '@satellatickets/core';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { cx } from '../_internal/cx';
import field from '../_internal/field.module.css';
import { Icon } from '../icon/Icon';
import styles from './Select.module.css';
import type { SelectOption, SelectWebProps } from './Select.types';

export type { SelectWebProps } from './Select.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga
// aquí su clase.
const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} satisfies Record<ControlSize, string | undefined>;

// Las teclas que mueven el resaltado, según el patrón de combobox de ARIA.
const keyDirection: Partial<Record<string, OptionDirection>> = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  Home: 'first',
  End: 'last',
  PageDown: 'nextPage',
  PageUp: 'previousPage',
};

/** Pasado este tiempo sin escribir, la siguiente letra empieza una búsqueda nueva. */
const SEARCH_TIMEOUT_MS = 500;

/** Lo escrito para buscar una opción y el momento de la última letra. */
const NO_SEARCH = { text: '', at: Number.NEGATIVE_INFINITY };

/** La opción resaltada: la que elegiría Intro. */
interface ActiveOption {
  value: string;
  /** Se ha llegado a ella con el teclado: se dibuja con el contorno de foco, no con fondo. */
  keyboard: boolean;
}

/**
 * Un botón que abre una lista propia (ADR-042). El foco no sale del botón: la opción
 * resaltada se comunica con `aria-activedescendant`, y la lista se pinta en la capa
 * superior del navegador, por encima de todo y sin que la recorte ningún contenedor.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  disabled,
  invalid,
  required,
  accessibilityLabel,
  id,
  name,
  className,
  style,
  testID,
  ref,
}: SelectWebProps) {
  const control = useFormFieldControl({ id, invalid, disabled, required, accessibilityLabel });
  // La cadena vacía es "sin elegir" (ADR-037).
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState<ActiveOption>();
  const baseId = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef(NO_SEARCH);
  // Dónde estaba el puntero la última vez que se supo de él.
  const pointer = useRef<{ x: number; y: number }>(undefined);

  // Si se deshabilita con la lista abierta, queda cerrada: no reaparece al habilitarlo.
  if (opened && control.disabled) setOpened(false);
  const open = opened && !control.disabled;
  const selected = options.find((option) => option.value === current);
  const activeIndex = open ? options.findIndex((option) => option.value === active?.value) : -1;
  const listId = `${baseId}-list`;
  const activeId = activeIndex === -1 ? undefined : `${baseId}-option-${activeIndex}`;

  /** Abre la lista con una opción resaltada: la indicada o, si no, la elegida. */
  function show(
    keyboard: boolean,
    highlighted = selected?.disabled === true ? undefined : selected,
  ) {
    setActive(highlighted === undefined ? undefined : { value: highlighted.value, keyboard });
    setOpened(true);
    // Abierta con el teclado, no se sabe dónde está el puntero.
    if (keyboard) pointer.current = undefined;
  }

  function choose(next: string) {
    setCurrent(next);
    setOpened(false);
  }

  // Coloca la lista bajo el disparador, o encima si debajo no cabe, y la mantiene ahí.
  useLayoutEffect(() => {
    const anchor = root.current;
    const popup = list.current;
    if (!open || anchor === null || popup === null) return;

    let above = false;
    const place = () => {
      const { top, bottom, left, width } = anchor.getBoundingClientRect();
      const viewport = document.documentElement.clientHeight;
      popup.dataset.side = above ? 'top' : 'bottom';
      popup.style.setProperty('--select-list-left', `${left}px`);
      popup.style.setProperty('--select-list-width', `${width}px`);
      popup.style.setProperty('--select-list-offset', `${above ? viewport - top : bottom}px`);
      popup.style.setProperty('--select-list-space', `${above ? top : viewport - bottom}px`);
    };

    const { top, bottom, width } = anchor.getBoundingClientRect();
    popup.style.setProperty('--select-list-width', `${width}px`);
    // En un navegador sin la API Popover se queda donde está, con `position: fixed`. Si ya
    // está en la capa superior (el modo estricto de React repite el efecto), no se repite.
    if (typeof popup.showPopover === 'function' && !popup.matches(':popover-open')) {
      popup.showPopover();
    }
    // Todavía sin límite de espacio: mide lo que ocuparía con sus márgenes.
    const wanted = popup.offsetHeight + parseFloat(getComputedStyle(popup).marginTop) * 2;
    const below = document.documentElement.clientHeight - bottom;
    above = below < wanted && top > below;
    place();
    // En una lista larga, la opción elegida empieza en el centro, con las vecinas a la vista.
    const chosen = popup.querySelector<HTMLElement>('[aria-selected="true"]');
    if (chosen !== null) {
      popup.scrollTop = chosen.offsetTop - (popup.clientHeight - chosen.offsetHeight) / 2;
    }

    // Pulsar fuera la cierra sin elegir.
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.contains(event.target)) setOpened(false);
    };
    const handleScroll = (event: Event) => {
      // El desplazamiento de la propia lista no mueve el disparador.
      if (event.target instanceof Node && popup.contains(event.target)) return;
      place();
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  // La opción resaltada siempre queda a la vista.
  useLayoutEffect(() => {
    if (activeId !== undefined) {
      document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId]);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Safari no enfoca un botón al pulsarlo, y el teclado y el cierre dependen del foco.
    event.currentTarget.focus();
    pointer.current = { x: event.clientX, y: event.clientY };
    if (open) setOpened(false);
    else show(false);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>, option: SelectOption) {
    // Con el dedo no hay nada que resaltar: se está desplazando la lista.
    if (event.pointerType === 'touch') return;
    // Safari avisa de un movimiento cuando la lista aparece o se desplaza bajo un puntero
    // quieto. Solo cuenta si ha cambiado de sitio: si no, el teclado perdería el resaltado.
    const last = pointer.current;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (last === undefined || (last.x === event.clientX && last.y === event.clientY)) return;
    if (option.disabled === true) return;
    if (active?.value !== option.value || active.keyboard) {
      setActive({ value: option.value, keyboard: false });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event;
    // Los atajos del navegador y del sistema no son para la lista.
    if (event.ctrlKey || event.metaKey) return;

    // Escribir busca la opción que empieza por ese texto. En mitad de una búsqueda, el
    // espacio es una letra más ("A Coruña").
    const searching = event.timeStamp - search.current.at < SEARCH_TIMEOUT_MS;
    if (key.length === 1 && !event.altKey && (key !== ' ' || searching)) {
      event.preventDefault();
      const text = searching ? search.current.text + key : key;
      search.current = { text, at: event.timeStamp };
      const match = findOptionByText(options, text, open ? active?.value : selected?.value);
      const option = options.find((candidate) => candidate.value === match);
      if (!open) show(true, option);
      else if (option !== undefined) setActive({ value: option.value, keyboard: true });
      return;
    }

    const direction = keyDirection[key];
    const confirms = key === 'Enter' || key === ' ';
    if (direction === undefined && !confirms && key !== 'Escape' && key !== 'Tab') return;
    // Cualquier otra tecla de la lista termina la búsqueda.
    search.current = NO_SEARCH;

    if (key === 'Escape') {
      if (!open) return;
      // Dentro de un `Modal`, Escape cierra la lista y no el diálogo.
      event.preventDefault();
      event.stopPropagation();
      setOpened(false);
      return;
    }

    if (key === 'Tab') {
      // Tab elige la opción resaltada y sigue su camino.
      if (open && active !== undefined) choose(active.value);
      return;
    }

    event.preventDefault();
    if (!open) {
      // Cerrada, cualquiera de estas teclas la abre; Inicio y Fin, ya en su extremo.
      const edge = direction === 'first' || direction === 'last';
      const value = edge ? getOptionInDirection(options, undefined, direction) : undefined;
      show(
        true,
        options.find((option) => option.value === value),
      );
      return;
    }

    // Intro, Espacio y Alt + flecha arriba eligen la resaltada; sin ninguna, solo cierran.
    if (confirms || (event.altKey && key === 'ArrowUp')) {
      if (active === undefined) setOpened(false);
      else choose(active.value);
      return;
    }

    if (direction === undefined || event.altKey) return;
    const next = getOptionInDirection(options, active?.value, direction);
    setActive(next === undefined ? undefined : { value: next, keyboard: true });
  }

  return (
    <div
      ref={root}
      className={cx(
        field.field,
        styles.root,
        sizeClass[size],
        control.invalid && field.invalid,
        control.disabled && field.disabled,
        className,
      )}
      style={style}
    >
      <button
        ref={ref}
        type="button"
        role="combobox"
        id={control.id}
        className={cx(field.control, styles.trigger, selected === undefined && styles.placeholder)}
        disabled={control.disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={activeId}
        aria-label={accessibilityLabel}
        aria-describedby={control.describedBy}
        aria-invalid={control.invalid ? true : undefined}
        // `aria-required` y no `required`: la librería no valida (ADR-037).
        aria-required={control.required ? true : undefined}
        data-testid={testID}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        // Firefox activa un botón al soltar el espacio aunque se haya cancelado al pulsarlo.
        onKeyUp={(event) => {
          if (event.key === ' ') event.preventDefault();
        }}
        // Perder el foco la cierra sin elegir.
        onBlur={() => setOpened(false)}
      >
        {/* Sin opción elegida, el texto visible es el placeholder. */}
        {selected?.label ?? placeholder ?? ''}
      </button>
      <span className={styles.chevron} aria-hidden="true">
        <Icon
          name="chevron-down"
          size={inputIconSize[size]}
          color={control.disabled ? 'disabled' : 'muted'}
        />
      </span>
      {/* La lista solo existe mientras está abierta. */}
      {open ? (
        <div
          ref={list}
          popover="manual"
          role="listbox"
          id={listId}
          // Fuera del orden de tabulación: una zona con desplazamiento entraría en él.
          tabIndex={-1}
          aria-label={control.accessibilityLabel}
          className={styles.list}
          // Pulsar en la lista no le quita el foco al disparador.
          onMouseDown={(event) => event.preventDefault()}
        >
          {options.map((option, index) => {
            const isSelected = option.value === current;
            const isDisabled = option.disabled === true;
            const isActive = index === activeIndex;
            return (
              // El teclado lo atiende el disparador, que es quien tiene el foco: la opción
              // solo responde al puntero.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
              <div
                key={option.value}
                id={`${baseId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled ? true : undefined}
                className={cx(
                  styles.option,
                  isActive && (active?.keyboard === true ? styles.focused : styles.active),
                  isDisabled && styles.disabled,
                )}
                onClick={isDisabled ? undefined : () => choose(option.value)}
                onPointerMove={(event) => handlePointerMove(event, option)}
              >
                <span className={styles.label}>{option.label}</span>
                {isSelected ? <Icon name="check" size={inputIconSize[size]} color="link" /> : null}
              </div>
            );
          })}
        </div>
      ) : null}
      {/* Con `name`, el valor viaja en un `<form>` como el de cualquier campo. */}
      {name === undefined ? null : (
        <input type="hidden" name={name} value={current} disabled={control.disabled} />
      )}
    </div>
  );
}
