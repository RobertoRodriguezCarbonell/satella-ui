import type { ControlSize } from './control';
import type { IconSize } from './icon';

/**
 * Qué se escribe en un `Input` (ADR-009). Cada vista lo traduce a su plataforma:
 * el atributo `type` y el teclado en web, y el teclado, las mayúsculas automáticas
 * y el autocompletado en nativo.
 */
export const inputTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number'] as const;
export type InputType = (typeof inputTypes)[number];

/** Tamaño de los iconos de un `Input` para cada tamaño de campo. */
export const inputIconSize = {
  sm: 'sm',
  md: 'md',
  lg: 'md',
} as const satisfies Record<ControlSize, IconSize>;

/**
 * Contrato de `Input`: un campo de texto de una línea. El conjunto de iconos lo aporta
 * `@satellatickets/icons`, que está fuera de `core` (ADR-002), por eso el nombre es
 * un parámetro de tipo.
 */
export interface InputProps<IconName extends string = string> {
  /** Texto controlado por la app. Sin él, el campo guarda su propio estado (ADR-037). */
  value?: string | undefined;
  /** Texto inicial cuando el campo guarda su propio estado. */
  defaultValue?: string | undefined;
  /** Se llama con el texto nuevo en cada cambio. */
  onChangeText?: ((text: string) => void) | undefined;
  placeholder?: string | undefined;
  /** Qué se escribe (por defecto `text`). */
  type?: InputType | undefined;
  size?: ControlSize | undefined;
  /** No se puede editar ni enfocar. */
  disabled?: boolean | undefined;
  /** Se puede enfocar y copiar, pero no editar. */
  readOnly?: boolean | undefined;
  /** El valor no es válido. Dentro de un `FormField` con `error` se activa solo. */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** Icono decorativo delante del texto. */
  iconStart?: IconName | undefined;
  /** Icono decorativo detrás del texto. */
  iconEnd?: IconName | undefined;
  maxLength?: number | undefined;
  onFocus?: (() => void) | undefined;
  onBlur?: (() => void) | undefined;
  /** Se pulsa Intro, o la tecla de envío del teclado en pantalla. */
  onSubmit?: (() => void) | undefined;
  /** Nombre accesible cuando no hay un `FormField` que lo etiquete. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
