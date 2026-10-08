import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { ToastContext, useToast } from './context';
import { createToastStore } from './store';

describe('useToast', () => {
  it('devuelve la cola del UIProvider que lo contiene', () => {
    const store = createToastStore();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(ToastContext.Provider, { value: store }, children);

    const { result } = renderHook(() => useToast(), { wrapper });
    const id = result.current.show({ title: 'Guardado', duration: 0 });

    expect(store.getSnapshot().map((toast) => toast.id)).toEqual([id]);
    result.current.dismiss(id);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('fuera de un UIProvider lanza un error que dice qué falta', () => {
    expect(() => renderHook(() => useToast())).toThrow(/UIProvider/);
  });
});
