import type { ReactNode } from 'react';

import type { IconSize } from './icon';

/** Variantes de `Button` (ADR-009). Las historias las usan para `argTypes` y la matriz `AllVariants`. */
export const buttonVariants = {
  variant: ['primary', 'secondary', 'ghost', 'danger'],
  size: ['sm', 'md', 'lg'],
} as const;

export type ButtonVariant = (typeof buttonVariants.variant)[number];
export type ButtonSize = (typeof buttonVariants.size)[number];

/** Tamaño del icono (y del spinner de carga) para cada tamaño de botón. */
export const buttonIconSize = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
} as const satisfies Record<ButtonSize, IconSize>;

/**
 * Contrato de `Button`. El conjunto de iconos lo aporta `@satellatickets/icons`,
 * que está fuera de `core` (ADR-002), por eso el nombre es un parámetro de tipo.
 */
export interface ButtonProps<IconName extends string = string> {
  /** Jerarquía visual de la acción (por defecto `primary`). */
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  /** No se puede pulsar ni enfocar. */
  disabled?: boolean | undefined;
  /**
   * Acción en curso: muestra un spinner y no dispara `onPress`, pero conserva el foco
   * y su anchura para que la interfaz no salte.
   */
  loading?: boolean | undefined;
  /** Icono delante del texto. */
  iconStart?: IconName | undefined;
  /** Icono detrás del texto. */
  iconEnd?: IconName | undefined;
  /** Ocupa todo el ancho de su contenedor. */
  fullWidth?: boolean | undefined;
  /** Se pulsa con ratón, teclado o toque. Nombre neutral: la vista web lo mapea a `click`. */
  onPress?: (() => void) | undefined;
  /** Nombre accesible cuando el texto visible no basta para describir la acción. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  children: ReactNode;
}
