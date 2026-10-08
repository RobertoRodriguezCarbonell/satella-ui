import { useCallback } from 'react';

import type { LinkPressEvent } from '../types/link';

export interface UseLinkOptions {
  onPress?: ((event: LinkPressEvent) => void) | undefined;
}

export interface UseLinkResult {
  /**
   * Llama a `onPress` y devuelve `true` si la navegación por defecto debe seguir,
   * es decir, si nadie llamó a `preventDefault()`.
   */
  press: () => boolean;
}

/**
 * Comportamiento de `Link` común a web y nativo: `onPress` se llama antes de navegar
 * y puede cancelar la navegación por defecto. Cada vista aporta esa navegación
 * (el `<a>` en web, `Linking` en nativo).
 */
export function useLink({ onPress }: UseLinkOptions): UseLinkResult {
  const press = useCallback(() => {
    let prevented = false;
    onPress?.({
      preventDefault: () => {
        prevented = true;
      },
      get defaultPrevented() {
        return prevented;
      },
    });
    return !prevented;
  }, [onPress]);
  return { press };
}
