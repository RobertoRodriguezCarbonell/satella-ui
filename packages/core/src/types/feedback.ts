/**
 * Los cuatro significados de `color.feedback` en los tokens: éxito, aviso, error e
 * información. Los comparten los componentes que comunican un estado.
 */
export const feedbackTones = ['success', 'warning', 'danger', 'info'] as const;
export type FeedbackTone = (typeof feedbackTones)[number];

export function isFeedbackTone(value: string): value is FeedbackTone {
  return (feedbackTones as readonly string[]).includes(value);
}
