import {
  clampPage,
  getPaginationItems,
  useControllableState,
  type PaginationSize,
} from '@satellatickets/core';

import { cx } from '../_internal/cx';
import buttonStyles from '../button/Button.module.css';
import { Icon } from '../icon/Icon';
import { IconButton } from '../icon-button/IconButton';
import styles from './Pagination.module.css';
import type { PaginationWebProps } from './Pagination.types';

export type { PaginationWebProps } from './Pagination.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga aquí
// su clase.
const sizeClass = {
  sm: styles.sm,
  md: styles.md,
} satisfies Record<PaginationSize, string | undefined>;

/**
 * Moverse entre las páginas de un listado (ADR-045): anterior, siguiente y los números,
 * resumidos alrededor de la página actual. Es un `<nav>` con una lista de botones.
 */
export function Pagination({
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  siblingCount = 1,
  size = 'md',
  disabled = false,
  accessibilityLabel,
  previousLabel,
  nextLabel,
  getPageLabel,
  className,
  style,
  testID,
}: PaginationWebProps) {
  const [value, setPage] = useControllableState({
    value: page,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });
  const current = clampPage(value, pageCount);
  const items = getPaginationItems({ page: current, pageCount, siblingCount });

  return (
    <nav
      aria-label={accessibilityLabel}
      className={cx(styles.root, sizeClass[size], className)}
      style={style}
      data-testid={testID}
    >
      <ul className={styles.list}>
        <li className={styles.item}>
          <IconButton
            icon="chevron-left"
            label={previousLabel}
            size={size}
            disabled={disabled || current <= 1}
            onPress={() => setPage(current - 1)}
          />
        </li>
        {items.map((item) =>
          item.type === 'ellipsis' ? (
            // Decorativo: los lectores de pantalla ya saben que la lista no es continua
            // por los números de las páginas que sí están.
            <li key={item.position} className={styles.ellipsis} aria-hidden="true">
              <Icon name="ellipsis" size="sm" />
            </li>
          ) : (
            <li key={item.page} className={styles.item}>
              {/* Las clases son las de `Button`: una página se ve y se comporta como un
                  botón, solo cambia su tamaño y cómo se marca la actual. */}
              <button
                type="button"
                className={cx(
                  buttonStyles.root,
                  styles.page,
                  item.page === current ? styles.current : buttonStyles.ghost,
                )}
                disabled={disabled}
                aria-label={getPageLabel?.(item.page)}
                aria-current={item.page === current ? 'page' : undefined}
                onClick={() => setPage(item.page)}
              >
                {item.page}
              </button>
            </li>
          ),
        )}
        <li className={styles.item}>
          <IconButton
            icon="chevron-right"
            label={nextLabel}
            size={size}
            disabled={disabled || current >= pageCount}
            onPress={() => setPage(current + 1)}
          />
        </li>
      </ul>
    </nav>
  );
}
