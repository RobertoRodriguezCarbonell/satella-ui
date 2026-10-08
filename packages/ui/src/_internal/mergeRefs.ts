import type { Ref, RefCallback } from 'react';

/** Un solo `ref` que actualiza varios: el interno del componente y el que recibe por props. */
export function mergeRefs<T>(...refs: ReadonlyArray<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref !== null && ref !== undefined) ref.current = node;
    }
  };
}
