import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createToastStore, TOAST_DEFAULT_DURATION, TOAST_MAX_VISIBLE } from './store';

describe('createToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('show añade el toast con sus valores por defecto y devuelve su id', () => {
    const store = createToastStore();

    const id = store.show({ title: 'Guardado' });

    expect(store.getSnapshot()).toEqual([
      {
        id,
        tone: 'info',
        title: 'Guardado',
        description: undefined,
        duration: TOAST_DEFAULT_DURATION,
        action: undefined,
        closeLabel: undefined,
      },
    ]);
  });

  it('cada toast tiene un id distinto y se ordenan del más antiguo al más reciente', () => {
    const store = createToastStore();

    const first = store.show({ title: 'Uno' });
    const second = store.show({ title: 'Dos' });

    expect(first).not.toBe(second);
    expect(store.getSnapshot().map((toast) => toast.title)).toEqual(['Uno', 'Dos']);
  });

  it('avisa a los suscriptores de cada cambio y deja de avisar al desuscribirse', () => {
    const store = createToastStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    const id = store.show({ title: 'Uno' });
    store.dismiss(id);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.show({ title: 'Dos' });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('el snapshot cambia de identidad con cada cambio y se mantiene si no hay ninguno', () => {
    const store = createToastStore();
    const empty = store.getSnapshot();
    expect(store.getSnapshot()).toBe(empty);

    store.show({ title: 'Uno' });

    expect(store.getSnapshot()).not.toBe(empty);
  });

  describe('cierre automático', () => {
    it('se cierra solo al pasar su duración', () => {
      const store = createToastStore();
      store.show({ title: 'Guardado' });

      vi.advanceTimersByTime(TOAST_DEFAULT_DURATION - 1);
      expect(store.getSnapshot()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(store.getSnapshot()).toHaveLength(0);
    });

    it('respeta la duración de cada toast', () => {
      const store = createToastStore();
      store.show({ title: 'Corto', duration: 1000 });
      store.show({ title: 'Largo', duration: 3000 });

      vi.advanceTimersByTime(1000);
      expect(store.getSnapshot().map((toast) => toast.title)).toEqual(['Largo']);

      vi.advanceTimersByTime(2000);
      expect(store.getSnapshot()).toHaveLength(0);
    });

    it('con duration 0 no se cierra solo', () => {
      const store = createToastStore();
      store.show({ title: 'Fijo', duration: 0 });

      vi.advanceTimersByTime(60_000);

      expect(store.getSnapshot()).toHaveLength(1);
    });
  });

  describe('dismiss', () => {
    it('cierra el toast indicado y cancela su temporizador', () => {
      const store = createToastStore();
      const listener = vi.fn();
      const first = store.show({ title: 'Uno' });
      store.show({ title: 'Dos' });
      store.subscribe(listener);

      store.dismiss(first);
      expect(store.getSnapshot().map((toast) => toast.title)).toEqual(['Dos']);

      vi.advanceTimersByTime(TOAST_DEFAULT_DURATION);
      // Un aviso por el cierre manual y otro por el automático del segundo: el primero no vuelve a avisar.
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('sin id los cierra todos', () => {
      const store = createToastStore();
      store.show({ title: 'Uno' });
      store.show({ title: 'Dos' });

      store.dismiss();

      expect(store.getSnapshot()).toHaveLength(0);
    });

    it('con un id desconocido o sin toasts no avisa a nadie', () => {
      const store = createToastStore();
      const listener = vi.fn();
      store.subscribe(listener);

      store.dismiss('no-existe');
      store.dismiss();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('límite de visibles', () => {
    it('al superar el límite retira los más antiguos', () => {
      const store = createToastStore();
      for (let index = 1; index <= TOAST_MAX_VISIBLE + 1; index += 1) {
        store.show({ title: `Aviso ${index}` });
      }

      expect(store.getSnapshot().map((toast) => toast.title)).toEqual([
        'Aviso 2',
        'Aviso 3',
        'Aviso 4',
      ]);
    });

    it('el toast retirado por el límite no deja su temporizador vivo', () => {
      const store = createToastStore();
      store.show({ title: 'Antiguo', duration: 1000 });
      for (let index = 0; index < TOAST_MAX_VISIBLE; index += 1) {
        store.show({ title: `Nuevo ${index}`, duration: 0 });
      }
      const listener = vi.fn();
      store.subscribe(listener);

      vi.advanceTimersByTime(1000);

      expect(listener).not.toHaveBeenCalled();
      expect(store.getSnapshot()).toHaveLength(TOAST_MAX_VISIBLE);
    });
  });

  describe('pausa', () => {
    it('mientras está en pausa nada se cierra, y al reanudar cuenta lo que quedaba', () => {
      const store = createToastStore();
      store.show({ title: 'Guardado', duration: 1000 });

      vi.advanceTimersByTime(600);
      store.pause();
      vi.advanceTimersByTime(10_000);
      expect(store.getSnapshot()).toHaveLength(1);

      store.resume();
      vi.advanceTimersByTime(399);
      expect(store.getSnapshot()).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(store.getSnapshot()).toHaveLength(0);
    });

    it('un toast que llega durante la pausa empieza a contar al reanudar', () => {
      const store = createToastStore();
      store.pause();
      store.show({ title: 'En pausa', duration: 1000 });

      vi.advanceTimersByTime(5000);
      expect(store.getSnapshot()).toHaveLength(1);

      store.resume();
      vi.advanceTimersByTime(1000);
      expect(store.getSnapshot()).toHaveLength(0);
    });

    it('pausar o reanudar dos veces seguidas no cambia nada', () => {
      const store = createToastStore();
      store.show({ title: 'Guardado', duration: 1000 });

      store.pause();
      vi.advanceTimersByTime(500);
      store.pause();
      store.resume();
      store.resume();
      vi.advanceTimersByTime(1000);

      expect(store.getSnapshot()).toHaveLength(0);
    });

    it('un toast sin cierre automático sigue sin cerrarse tras una pausa', () => {
      const store = createToastStore();
      store.show({ title: 'Fijo', duration: 0 });

      store.pause();
      store.resume();
      vi.advanceTimersByTime(60_000);

      expect(store.getSnapshot()).toHaveLength(1);
    });
  });
});
