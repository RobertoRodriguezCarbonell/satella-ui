import type { ButtonSize, ButtonVariant } from './button';
import type { IconSize } from './icon';

/**
 * Tamaño del icono para cada tamaño de `IconButton`. Es un paso mayor que en
 * `Button`, porque aquí el icono es todo el contenido.
 */
export const iconButtonIconSize = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const satisfies Record<ButtonSize, IconSize>;

/**
 * Contrato de `IconButton`: un `Button` cuadrado cuyo único contenido es un icono.
 * Comparte variantes y tamaños con `Button` (`buttonVariants`). El conjunto de iconos
 * lo aporta `@satellatickets/icons`, que está fuera de `core` (ADR-002), por eso el
 * nombre es un parámetro de tipo.
 */
export interface IconButtonProps<IconName extends string = string> {
  icon: IconName;
  /**
   * Nombre accesible. Es obligatorio porque no hay texto visible: describe la
   * acción ("Cerrar"), no el dibujo ("Aspa").
   */
  label: string;
  /** Jerarquía visual de la acción (por defecto `ghost`). */
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  /** No se puede pulsar ni enfocar. */
  disabled?: boolean | undefined;
  /** Acción en curso: sustituye el icono por un spinner y no dispara `onPress`, pero conserva el foco. */
  loading?: boolean | undefined;
  /** Se pulsa con ratón, teclado o toque. Nombre neutral: la vista web lo mapea a `click`. */
  onPress?: (() => void) | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
