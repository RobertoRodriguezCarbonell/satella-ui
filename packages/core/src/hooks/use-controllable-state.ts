import { useCallback, useState } from 'react';

export interface UseControllableStateOptions<T> {
  /** Valor controlado por la app. Si existe, manda sobre el estado interno. */
  value?: T | undefined;
  /** Valor inicial cuando el componente guarda su propio estado. */
  defaultValue: T;
  /** Se llama con el valor nuevo cuando cambia, en los dos modos. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * Estado controlado o no, a elección de la app (ADR-037). Con `value`, el componente
 * solo avisa del cambio y espera a que la app le pase el valor nuevo; sin él, guarda
 * el estado a partir de `defaultValue`. No avisa si el valor no cambia.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const set = useCallback(
    (next: T) => {
      if (Object.is(next, current)) return;
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, current, onChange],
  );

  return [current, set];
}
