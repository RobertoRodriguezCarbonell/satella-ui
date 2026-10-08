import type { FeedbackTone } from './feedback';
import type { TextColorToken } from './text';

export const iconSizes = ['sm', 'md', 'lg'] as const;
export type IconSize = (typeof iconSizes)[number];

/** Tamaño en px/puntos de cada icono. */
export const iconSizePx = { sm: 16, md: 20, lg: 24 } satisfies Record<IconSize, number>;

/**
 * Color de un icono: un color de texto o el de un estado de feedback (`success`,
 * `warning`, `danger`, `info`), que usa el token `color.feedback.<estado>.icon`.
 */
export type IconColor = TextColorToken | FeedbackTone;

/**
 * Contrato de `Icon`. El conjunto de nombres lo aporta `@satellatickets/icons`,
 * que está fuera de `core` (ADR-002), por eso el nombre es un parámetro de tipo.
 */
export interface IconProps<Name extends string = string> {
  name: Name;
  size?: IconSize | undefined;
  color?: IconColor | undefined;
  /** Texto alternativo. Sin él, el icono es decorativo y se oculta a los lectores de pantalla. */
  label?: string | undefined;
  testID?: string | undefined;
}
