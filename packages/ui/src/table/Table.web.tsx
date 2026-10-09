import {
  getNextSort,
  getSelectionState,
  textVariantStyles,
  toggleAllSelected,
  toggleSelectedKey,
  useControllableState,
  type TableAlign,
  type TableColumn,
  type TableSize,
  type TableSort,
} from '@satellatickets/core';
import { cssVariables } from '@satellatickets/tokens';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { cx } from '../_internal/cx';
import { Checkbox } from '../checkbox/Checkbox';
import { Icon } from '../icon/Icon';
import { Skeleton } from '../skeleton/Skeleton';
import { sortIcon, unsortedIcon } from './sortIcon';
import styles from './Table.module.css';
import type { TableWebProps } from './Table.types';

export type { TableWebProps } from './Table.types';

// Mapas exhaustivos (ADR-014): un tamaño o una alineación nuevos en `core` no compilan
// hasta que tengan aquí su clase.
const sizeClass = {
  sm: styles.sm,
  md: styles.md,
} satisfies Record<TableSize, string | undefined>;

const alignClass = {
  start: styles.start,
  center: styles.center,
  end: styles.end,
} satisfies Record<TableAlign, string | undefined>;

// La cabecera usa la tipografía de etiqueta de `Text`, leída del mismo mapa de `core`.
const label = textVariantStyles.label;
const headerVars: Record<`--table-header-${string}`, string> = {
  '--table-header-family': `var(${cssVariables[`font.family.${label.family}`]})`,
  '--table-header-size': `var(${cssVariables[`font.size.${label.size}`]})`,
  '--table-header-line-height': `var(${cssVariables[`font.lineHeight.${label.size}`]})`,
  '--table-header-weight': `var(${cssVariables[`font.weight.${label.weight}`]})`,
};
if (label.letterSpacing !== undefined) {
  headerVars['--table-header-letter-spacing'] = `${label.letterSpacing}px`;
}

// Anchos de los huecos de carga, para que no parezcan una cuadrícula.
const SKELETON_WIDTHS = ['70%', '50%', '85%', '60%'] as const;

function columnSize<Row>(column: TableColumn<Row>): CSSProperties | undefined {
  if (column.width === undefined && column.minWidth === undefined) return undefined;
  return { width: column.width, minWidth: column.width ?? column.minWidth };
}

/**
 * Una tabla de datos (ADR-045): un `<table>` real dentro de un contenedor que se desplaza
 * en horizontal si no cabe. Pinta las filas que recibe y en ese orden; ordenar y paginar
 * los datos es cosa de la app.
 */
export function Table<Row>({
  columns,
  rows,
  getRowKey,
  accessibilityLabel,
  size = 'md',
  sort,
  defaultSort,
  onSortChange,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys,
  onSelectedKeysChange,
  selectAllLabel,
  getRowSelectionLabel,
  loading = false,
  loadingRowCount = 5,
  empty,
  className,
  style,
  testID,
}: TableWebProps<Row>) {
  const [currentSort, setSort] = useControllableState<TableSort | null>({
    value: sort,
    defaultValue: defaultSort ?? null,
    onChange: (next) => {
      if (next !== null) onSortChange?.(next);
    },
  });
  const [selected, setSelected] = useControllableState<readonly string[]>({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys ?? [],
    onChange: onSelectedKeysChange,
  });

  // Si la tabla no cabe, su contenedor se desplaza, y entonces tiene que poder recibir el
  // foco para que el teclado lo mueva. Si cabe, no añade una parada de tabulación.
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const element = scroller.current;
    if (element === null) return undefined;
    const measure = () => setScrollable(element.scrollWidth > element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild !== null) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, []);

  const keys = rows.map(getRowKey);
  const chosen = new Set(selected);
  const selection = getSelectionState(keys, selected);
  const columnCount = columns.length + (selectable ? 1 : 0);
  const skeletonCount = rows.length > 0 ? rows.length : Math.max(1, loadingRowCount);
  const hasEmpty = empty !== undefined && empty !== null;

  return (
    <div
      className={cx(styles.root, sizeClass[size], className)}
      style={{ ...headerVars, ...style }}
      data-testid={testID}
    >
      <div
        ref={scroller}
        className={styles.scroll}
        {...(scrollable
          ? { role: 'region', 'aria-label': accessibilityLabel, tabIndex: 0 }
          : undefined)}
      >
        <table
          className={styles.table}
          aria-label={accessibilityLabel}
          aria-busy={loading ? true : undefined}
        >
          <thead>
            <tr>
              {selectable ? (
                // Una celda y no una cabecera: la columna de casillas no tiene título.
                <td className={cx(styles.header, styles.selection)}>
                  <Checkbox
                    checked={selection === 'all'}
                    indeterminate={selection === 'some'}
                    disabled={loading || rows.length === 0}
                    accessibilityLabel={selectAllLabel}
                    onCheckedChange={() => setSelected(toggleAllSelected(keys, selected))}
                  />
                </td>
              ) : null}
              {columns.map((column) => {
                const sorted = currentSort?.column === column.key ? currentSort : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={sorted?.direction}
                    className={cx(
                      styles.header,
                      label.uppercase && styles.uppercase,
                      alignClass[column.align ?? 'start'],
                      column.sortable && styles.sortable,
                    )}
                    style={columnSize(column)}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={styles.sort}
                        onClick={() => setSort(getNextSort(currentSort, column.key))}
                      >
                        <span className={column.headerHidden ? styles.hidden : undefined}>
                          {column.header}
                        </span>
                        <Icon
                          name={sorted === undefined ? unsortedIcon : sortIcon[sorted.direction]}
                          size="sm"
                        />
                      </button>
                    ) : (
                      <span className={column.headerHidden ? styles.hidden : undefined}>
                        {column.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonCount }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {selectable ? <td className={cx(styles.cell, styles.selection)} /> : null}
                  {columns.map((column, columnIndex) => (
                    <td key={column.key} className={styles.cell}>
                      <Skeleton
                        variant="bodySmall"
                        width={SKELETON_WIDTHS[(rowIndex + columnIndex) % SKELETON_WIDTHS.length]}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              hasEmpty ? (
                <tr>
                  <td colSpan={columnCount} className={cx(styles.cell, styles.empty)}>
                    {empty}
                  </td>
                </tr>
              ) : null
            ) : (
              rows.map((row, rowIndex) => {
                const key = keys[rowIndex] ?? '';
                const isSelected = selectable && chosen.has(key);
                return (
                  <tr key={key} className={isSelected ? styles.selected : undefined}>
                    {selectable ? (
                      <td className={cx(styles.cell, styles.selection)}>
                        <Checkbox
                          checked={isSelected}
                          accessibilityLabel={getRowSelectionLabel?.(row)}
                          onCheckedChange={() => setSelected(toggleSelectedKey(selected, key))}
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => {
                      const cellClass = cx(styles.cell, alignClass[column.align ?? 'start']);
                      // La celda que identifica a la fila es su cabecera.
                      return column.rowHeader ? (
                        <th key={column.key} scope="row" className={cellClass}>
                          {column.cell(row)}
                        </th>
                      ) : (
                        <td key={column.key} className={cellClass}>
                          {column.cell(row)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
