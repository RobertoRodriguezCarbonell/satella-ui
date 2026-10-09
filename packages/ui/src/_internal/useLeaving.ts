import { useState } from 'react';

/** Un elemento de la lista y si ya ha salido de ella. */
export interface Leaving<T> {
  item: T;
  /** Ya no está en la lista: sigue pintándose solo mientras dura su salida. */
  leaving: boolean;
}

/**
 * Los elementos de una lista y, además, los que acaban de salir de ella. Sirve para
 * animar la salida (ADR-043): quien pinta la lista sigue pintando los que se van y
 * llama a `remove` cuando su animación termina.
 */
export function useLeaving<T extends { id: string }>(
  current: readonly T[],
): [items: Leaving<T>[], remove: (id: string) => void] {
  const [kept, setKept] = useState(current);
  const byId = new Map(current.map((item) => [item.id, item]));
  // Los de antes, en su sitio y al día, y detrás los que acaban de llegar.
  const merged = [
    ...kept.map((item) => byId.get(item.id) ?? item),
    ...current.filter((item) => !kept.some((known) => known.id === item.id)),
  ];
  if (merged.length !== kept.length || merged.some((item, index) => item !== kept[index])) {
    setKept(merged);
  }
  return [
    merged.map((item) => ({ item, leaving: !byId.has(item.id) })),
    (id) => setKept((items) => items.filter((item) => item.id !== id)),
  ];
}
