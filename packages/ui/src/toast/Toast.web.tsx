import { useEffect, useRef } from 'react';

import { afterAnimations } from '../_internal/afterAnimations';
import { feedbackIcon, feedbackUrgent } from '../_internal/feedback';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { IconButton } from '../icon-button/IconButton';
import styles from './Toast.module.css';
import type { ToastCardProps } from './Toast.types';

/**
 * La tarjeta de un toast. Es interna: los toasts se muestran con `useToast` y los
 * pinta `UIProvider` (ADR-039).
 */
export function Toast({ toast, onDismiss, leaving = false, onExited }: ToastCardProps) {
  const { tone, title, description, action, closeLabel } = toast;
  const root = useRef<HTMLDivElement>(null);

  // La salida la anima el CSS con `data-closing`; al terminar, la zona deja de pintarlo.
  useEffect(() => {
    if (!leaving || root.current === null || onExited === undefined) return;
    return afterAnimations(root.current, onExited);
  }, [leaving, onExited]);

  return (
    <div
      ref={root}
      className={styles.root}
      // `alert` interrumpe al lector de pantalla; `status` espera a que termine de leer.
      role={feedbackUrgent[tone] ? 'alert' : 'status'}
      // Mientras se va ya no existe para el lector de pantalla.
      aria-hidden={leaving ? true : undefined}
      data-closing={leaving ? '' : undefined}
    >
      <span className={styles.icon}>
        <Icon name={feedbackIcon[tone]} size="md" color={tone} />
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description === undefined ? null : <p className={styles.description}>{description}</p>}
      </div>
      {action === undefined && closeLabel === undefined ? null : (
        <div className={styles.actions}>
          {action === undefined ? null : (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                action.onPress();
                onDismiss();
              }}
            >
              {action.label}
            </Button>
          )}
          {closeLabel === undefined ? null : (
            <IconButton icon="x" label={closeLabel} size="sm" variant="ghost" onPress={onDismiss} />
          )}
        </div>
      )}
    </div>
  );
}
