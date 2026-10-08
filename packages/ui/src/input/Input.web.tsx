import {
  inputIconSize,
  useFormFieldControl,
  type ControlSize,
  type InputType,
} from '@satellatickets/core';
import type { HTMLAttributes, KeyboardEvent, MouseEvent } from 'react';

import { cx } from '../_internal/cx';
import field from '../_internal/field.module.css';
import { Icon } from '../icon/Icon';
import styles from './Input.module.css';
import type { InputWebProps } from './Input.types';

export type { InputWebProps } from './Input.types';

interface TypeAttributes {
  type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
}

// Mapas exhaustivos (ADR-014): un tipo o un tamaño nuevos en `core` no compilan hasta
// que tengan aquí su traducción.
const typeAttributes = {
  text: { type: 'text' },
  email: { type: 'email' },
  password: { type: 'password' },
  search: { type: 'search' },
  tel: { type: 'tel' },
  url: { type: 'url' },
  // `type="number"` cambia el valor con la rueda del ratón y admite letras como "e":
  // un campo de texto con teclado numérico es más fiable.
  number: { type: 'text', inputMode: 'decimal' },
} satisfies Record<InputType, TypeAttributes>;

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} satisfies Record<ControlSize, string | undefined>;

export function Input({
  value,
  defaultValue,
  onChangeText,
  placeholder,
  type = 'text',
  size = 'md',
  disabled,
  readOnly = false,
  invalid,
  required,
  iconStart,
  iconEnd,
  maxLength,
  onFocus,
  onBlur,
  onSubmit,
  accessibilityLabel,
  id,
  name,
  autoComplete,
  className,
  style,
  testID,
  ref,
}: InputWebProps) {
  const control = useFormFieldControl({ id, invalid, disabled, required });
  const attributes: TypeAttributes = typeAttributes[type];
  const iconSize = inputIconSize[size];
  const iconColor = control.disabled ? 'disabled' : 'muted';

  // Pulsar el borde o un icono enfoca el campo: toda la caja se comporta como el `<input>`.
  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    const input = event.currentTarget.querySelector('input');
    if (input === null || event.target === input || control.disabled) return;
    event.preventDefault();
    input.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Mientras se compone un carácter (acentos, teclados asiáticos), Intro no envía.
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) onSubmit?.();
  }

  return (
    // La caja no es un control: solo reenvía el clic al `<input>`, que es quien recibe
    // el foco, el teclado y los lectores de pantalla.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={cx(
        field.field,
        styles.root,
        sizeClass[size],
        control.invalid && field.invalid,
        readOnly && field.readOnly,
        control.disabled && field.disabled,
        className,
      )}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {iconStart === undefined ? null : <Icon name={iconStart} size={iconSize} color={iconColor} />}
      <input
        ref={ref}
        id={control.id}
        className={cx(field.control, styles.input)}
        type={attributes.type}
        inputMode={attributes.inputMode}
        name={name}
        autoComplete={autoComplete}
        // Controlado si la app pasa `value`; si no, el navegador guarda el texto (ADR-037).
        {...(value === undefined ? { defaultValue } : { value })}
        onChange={(event) => onChangeText?.(event.target.value)}
        placeholder={placeholder}
        disabled={control.disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        aria-label={accessibilityLabel}
        aria-describedby={control.describedBy}
        aria-invalid={control.invalid ? true : undefined}
        // `aria-required` y no `required`: la librería no valida (ADR-037), y así el
        // navegador no muestra su propio aviso al enviar el formulario.
        aria-required={control.required ? true : undefined}
        data-testid={testID}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
      />
      {iconEnd === undefined ? null : <Icon name={iconEnd} size={iconSize} color={iconColor} />}
    </div>
  );
}
