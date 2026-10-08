import type { FeedbackTone } from '@satellatickets/core';

import { cx } from '../_internal/cx';
import { feedbackIcon, feedbackUrgent } from '../_internal/feedback';
import { Icon } from '../icon/Icon';
import { IconButton } from '../icon-button/IconButton';
import styles from './Alert.module.css';
import type { AlertWebProps } from './Alert.types';

export type { AlertWebProps } from './Alert.types';

// Mapa exhaustivo (ADR-014): un tono nuevo en `core` no compila hasta que tenga aquí
// su clase. El icono y la urgencia de cada tono están en `_internal/feedback`.
const toneClass = {
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
} satisfies Record<FeedbackTone, string | undefined>;

export function Alert({
  tone = 'info',
  title,
  onClose,
  closeLabel,
  className,
  style,
  testID,
  children,
}: AlertWebProps) {
  const hasDescription = children !== undefined && children !== null;
  return (
    <div
      className={cx(styles.root, toneClass[tone], className)}
      style={style}
      // `alert` interrumpe al lector de pantalla; `status` espera a que termine de leer.
      role={feedbackUrgent[tone] ? 'alert' : 'status'}
      data-testid={testID}
    >
      {/* El icono refuerza el color: el tono no depende solo de él. */}
      <span className={styles.icon}>
        <Icon name={feedbackIcon[tone]} size="md" color={tone} />
      </span>
      <div className={styles.content}>
        {title === undefined ? null : <p className={styles.title}>{title}</p>}
        {hasDescription ? <div className={styles.description}>{children}</div> : null}
      </div>
      {onClose === undefined ? null : (
        <IconButton
          icon="x"
          label={closeLabel}
          size="sm"
          variant="ghost"
          onPress={onClose}
          className={styles.close}
        />
      )}
    </div>
  );
}
