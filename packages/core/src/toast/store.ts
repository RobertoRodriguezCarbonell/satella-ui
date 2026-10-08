import type { ToastApi, ToastItem, ToastOptions } from '../types/toast';

/** Milisegundos que un toast permanece visible si no se indica otra cosa. */
export const TOAST_DEFAULT_DURATION = 5000;

/** Toasts visibles a la vez. Al llegar uno más, se retira el más antiguo. */
export const TOAST_MAX_VISIBLE = 3;

export interface ToastStore extends ToastApi {
  /** Para `useSyncExternalStore`: avisa de cada cambio y devuelve cómo dejar de escuchar. */
  subscribe: (listener: () => void) => () => void;
  /** Los toasts visibles, del más antiguo al más reciente. Cambia de identidad con cada cambio. */
  getSnapshot: () => readonly ToastItem[];
  /** Detiene el cierre automático, por ejemplo mientras el puntero está sobre los toasts. */
  pause: () => void;
  /** Reanuda el cierre automático con el tiempo que le quedaba a cada toast. */
  resume: () => void;
}

interface Timer {
  handle: ReturnType<typeof setTimeout> | undefined;
  /** Cuándo empezó a contar la cuenta atrás en curso. */
  startedAt: number;
  /** Lo que quedaba al empezar (o al pausar). */
  remaining: number;
}

/**
 * La cola de toasts de un `UIProvider` (ADR-039): alta, baja, cierre automático, pausa
 * y límite de visibles. No depende de React ni de la plataforma.
 */
export function createToastStore(): ToastStore {
  let items: readonly ToastItem[] = [];
  let paused = false;
  let nextId = 0;
  const timers = new Map<string, Timer>();
  const listeners = new Set<() => void>();

  function emit(next: readonly ToastItem[]) {
    items = next;
    for (const listener of listeners) listener();
  }

  function stop(id: string) {
    const timer = timers.get(id);
    if (timer?.handle !== undefined) clearTimeout(timer.handle);
    timers.delete(id);
  }

  function start(id: string, remaining: number) {
    const timer: Timer = { handle: undefined, startedAt: Date.now(), remaining };
    if (!paused) timer.handle = setTimeout(() => dismiss(id), remaining);
    timers.set(id, timer);
  }

  function dismiss(id?: string) {
    if (id === undefined) {
      if (items.length === 0) return;
      for (const item of items) stop(item.id);
      emit([]);
      return;
    }
    if (!items.some((item) => item.id === id)) return;
    stop(id);
    emit(items.filter((item) => item.id !== id));
  }

  function show(options: ToastOptions): string {
    nextId += 1;
    const item: ToastItem = {
      id: `toast-${nextId}`,
      tone: options.tone ?? 'info',
      title: options.title,
      description: options.description,
      duration: options.duration ?? TOAST_DEFAULT_DURATION,
      action: options.action,
      closeLabel: options.closeLabel,
    };
    const next = [...items, item];
    // Al superar el límite, se retiran los más antiguos.
    for (const old of next.splice(0, Math.max(0, next.length - TOAST_MAX_VISIBLE))) stop(old.id);
    if (item.duration > 0) start(item.id, item.duration);
    emit(next);
    return item.id;
  }

  function pause() {
    if (paused) return;
    paused = true;
    const now = Date.now();
    for (const timer of timers.values()) {
      if (timer.handle !== undefined) clearTimeout(timer.handle);
      timer.handle = undefined;
      timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt));
    }
  }

  function resume() {
    if (!paused) return;
    paused = false;
    for (const [id, timer] of timers) start(id, timer.remaining);
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => items,
    show,
    dismiss,
    pause,
    resume,
  };
}
