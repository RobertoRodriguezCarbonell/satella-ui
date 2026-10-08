import { cx } from '../_internal/cx';
import { Icon } from '../icon/Icon';
import styles from './Spinner.module.css';
import type { SpinnerWebProps } from './Spinner.types';

export type { SpinnerWebProps } from './Spinner.types';

/**
 * Indicador de carga indeterminada: el icono `loader-circle` girando. Con `label` es
 * una barra de progreso indeterminada para los lectores de pantalla; sin él, es
 * decorativo. Con movimiento reducido gira más despacio, pero no se detiene: parado
 * no diría que algo está en curso.
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
