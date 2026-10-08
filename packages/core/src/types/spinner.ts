import { iconSizePx, iconSizes, type IconSize } from './icon';
import type { TextColorToken } from './text';

/**
 * `Spinner` comparte la escala de `Icon`: así puede ocupar el sitio de un icono
 * (por ejemplo, dentro de un botón que carga) sin mover el resto del contenido.
 * `xl` es para la carga de una página o de una sección entera.
 */
export const spinnerSizes = iconSizes;
export type SpinnerSize = IconSize;

/** Tamaño en px/puntos de cada spinner. */
export const spinnerSizePx = iconSizePx;

export interface SpinnerProps {
  size?: SpinnerSize | undefined;
  color?: TextColorToken | undefined;
  /**
   * Texto que anuncian los lectores de pantalla ("Cargando eventos"). Sin él, el
   * spinner es decorativo: úsalo así solo si el estado de carga ya se comunica de otra forma.
   */
  label?: string | undefined;
  testID?: string | undefined;
}
