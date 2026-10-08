import { cx } from '../_internal/cx';
import { Icon } from '../icon/Icon';
import styles from './Spinner.module.css';
import type { SpinnerWebProps } from './Spinner.types';

/**
 * Indicador de carga indeterminada. Versión mínima (ROADMAP Fase 3): el icono
 * `loader-circle` girando. Con `label` es una barra de progreso indeterminada
 * para los lectores de pantalla; sin él, es decorativo.
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  label,
  className,
  testID,
}: SpinnerWebProps) {
  const decorative = label === undefined;
  return (
    <span
      className={cx(styles.root, className)}
      role={decorative ? undefined : 'progressbar'}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      data-testid={testID}
    >
      <Icon name="loader-circle" size={size} color={color} className={styles.icon} />
    </span>
  );
}
