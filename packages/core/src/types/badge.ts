import type { ReactNode } from 'react';

/**
 * Variantes de `Badge` (ADR-009): una por cada color de `color.feedback`. Las historias
 * las usan para `argTypes` y la matriz `AllVariants`.
 */
export const badgeVariants = ['success', 'warning', 'danger', 'info'] as const;
export type BadgeVariant = (typeof badgeVariants)[number];

export interface BadgeProps {
  /** Significado del estado que etiqueta (por defecto `info`). */
  variant?: BadgeVariant | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  children: ReactNode;
}
