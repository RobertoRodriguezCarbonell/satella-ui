import type { ReactNode } from 'react';

import type { SpaceToken } from './box';

/**
 * Variantes de `Card` (ADR-009): `outlined` se apoya en el borde; `elevated` añade
 * sombra para separarse de lo que tiene debajo.
 */
export const cardVariants = ['outlined', 'elevated'] as const;
export type CardVariant = (typeof cardVariants)[number];

/**
 * Contrato de `Card`: una superficie que agrupa contenido relacionado. Con `onPress`
 * toda la tarjeta es pulsable; en ese caso no debe contener otros controles.
 */
export interface CardProps {
  variant?: CardVariant | undefined;
  /** Relleno interior (por defecto 4). Con `0`, el contenido llega hasta el borde, por ejemplo una imagen. */
  padding?: SpaceToken | undefined;
  /** Hace pulsable toda la tarjeta, con ratón, teclado o toque. */
  onPress?: (() => void) | undefined;
  /**
   * Nombre accesible de una tarjeta pulsable. Sin él, es su contenido, que suele ser lo
   * correcto. Si se indica, tiene que incluir el texto visible: quien navega por voz
   * dice lo que ve.
   */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  children?: ReactNode;
}
