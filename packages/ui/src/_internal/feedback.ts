import type { FeedbackTone } from '@satellatickets/core';

import type { IconName } from '../icon/Icon.types';

// Mapas exhaustivos (ADR-014) que comparten los componentes de feedback (`Alert`,
// `Toast`): un tono nuevo en `core` no compila hasta que tenga aquí su icono y su urgencia.

/** El icono refuerza el color: el tono no depende solo de él. */
export const feedbackIcon = {
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-x',
  info: 'info',
} satisfies Record<FeedbackTone, IconName>;

/**
 * Si el tono interrumpe al lector de pantalla (`alert`, `assertive`) o espera a que
 * termine de leer (`status`, `polite`).
 */
export const feedbackUrgent = {
  success: false,
  warning: true,
  danger: true,
  info: false,
} satisfies Record<FeedbackTone, boolean>;
