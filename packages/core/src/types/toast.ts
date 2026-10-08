import type { FeedbackTone } from './feedback';

/** Acción opcional de un toast, por ejemplo "Deshacer". */
export interface ToastAction {
  label: string;
  onPress: () => void;
}

/** Lo que recibe `show()` de `useToast` (ADR-039). */
export interface ToastOptions {
  /** Qué comunica (por defecto `info`). Fija el icono y la urgencia con que se anuncia. */
  tone?: FeedbackTone | undefined;
  /** El mensaje, en una línea. */
  title: string;
  /** Detalle opcional. */
  description?: string | undefined;
  /**
   * Milisegundos hasta que se cierra solo (por defecto 5000). Con `0` no se cierra
   * solo: necesita `closeLabel`, una `action` o una llamada a `dismiss`.
   */
  duration?: number | undefined;
  /** Botón de acción. Al pulsarlo se llama a `onPress` y el toast se cierra. */
  action?: ToastAction | undefined;
  /**
   * Si existe, el toast muestra un botón de cierre con este nombre accesible
   * ("Cerrar aviso"). La librería no trae textos propios.
   */
  closeLabel?: string | undefined;
}

/** Un toast ya en la cola: sus opciones resueltas y su identificador. */
export interface ToastItem {
  id: string;
  tone: FeedbackTone;
  title: string;
  description: string | undefined;
  duration: number;
  action: ToastAction | undefined;
  closeLabel: string | undefined;
}

/** Lo que devuelve `useToast`. */
export interface ToastApi {
  /** Muestra un toast y devuelve su `id`. */
  show: (options: ToastOptions) => string;
  /** Cierra el toast con ese `id`; sin `id`, los cierra todos. */
  dismiss: (id?: string) => void;
}
