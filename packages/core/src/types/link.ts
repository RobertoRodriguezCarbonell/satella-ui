import type { ReactNode } from 'react';

import type { TextColorToken, TextVariant } from './text';

/**
 * Cuándo se subraya un `Link` (ADR-009). `always` es lo correcto dentro de un párrafo:
 * el color solo no basta para distinguir un enlace. `hover` lo subraya al pasar el
 * puntero o enfocarlo en web, y mientras se pulsa en nativo.
 */
export const linkUnderlines = ['always', 'hover'] as const;
export type LinkUnderline = (typeof linkUnderlines)[number];

/** Lo que recibe `onPress` de un `Link`: permite cancelar la navegación por defecto. */
export interface LinkPressEvent {
  /** Cancela la navegación por defecto, por ejemplo para hacerla con el router de la app. */
  preventDefault: () => void;
  readonly defaultPrevented: boolean;
}

export interface LinkProps {
  /** Destino. En web es el `href` del `<a>`; en nativo se abre con `Linking`. */
  href: string;
  /**
   * Tipografía, con las mismas variantes que `Text`. Sin ella hereda la del texto
   * que lo contiene; fuera de un `Text`, usa `body`.
   */
  variant?: TextVariant | undefined;
  /** Color del texto (por defecto `link`). */
  color?: TextColorToken | undefined;
  underline?: LinkUnderline | undefined;
  /**
   * Se llama antes de navegar. Con `event.preventDefault()` la librería no navega y
   * la app decide qué hacer. En web no se llama si el clic lleva un modificador
   * (Ctrl, Cmd, Mayús, Alt) o no es del botón principal: ahí manda el navegador.
   */
  onPress?: ((event: LinkPressEvent) => void) | undefined;
  /** Nombre accesible cuando el texto visible no basta para describir el destino. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  children: ReactNode;
}
