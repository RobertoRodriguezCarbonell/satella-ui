import { useCallback } from 'react';

export interface UseButtonOptions {
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  onPress?: (() => void) | undefined;
}

export interface UseButtonResult {
  disabled: boolean;
  loading: boolean;
  /** `false` si está deshabilitado o cargando: el botón no responde a la pulsación. */
  interactive: boolean;
  /** Llama a `onPress` solo si el botón es interactivo. */
  press: () => void;
}

/**
 * Comportamiento de `Button` común a web y nativo: un botón deshabilitado o que
 * está cargando no dispara `onPress`. Cada vista añade su accesibilidad
 * (`disabled`/`aria-busy` en web, `accessibilityState` en nativo).
 */
export function useButton({
  disabled = false,
  loading = false,
  onPress,
}: UseButtonOptions): UseButtonResult {
  const interactive = !disabled && !loading;
  const press = useCallback(() => {
    if (interactive) onPress?.();
  }, [interactive, onPress]);
  return { disabled, loading, interactive, press };
}
