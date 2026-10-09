import {
  getColumnWidths,
  getNextSort,
  getSelectionState,
  textVariantStyles,
  toggleAllSelected,
  toggleSelectedKey,
  useControllableState,
  useTheme,
  type SortDirection,
  type TableAlign,
  type TableSize,
  type TableSort,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { Children, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Checkbox } from '../checkbox/Checkbox';
import { Icon } from '../icon/Icon';
import { Skeleton } from '../skeleton/Skeleton';
import { sortIcon, unsortedIcon } from './sortIcon';
import type { TableNativeProps } from './Table.types';

export type { TableNativeProps } from './Table.types';

interface SizeStyle {
  /** Altura mínima de una fila: la de un control de ese tamaño. */
  rowHeight: number;
  paddingX: number;
  paddingY: number;
}

interface AlignStyle {
  /** Dónde se coloca el contenido de la celda, que es una columna flex. */
  items: NonNullable<ViewStyle['alignItems']>;
  text: NonNullable<TextStyle['textAlign']>;
}

// Mapas exhaustivos (ADR-014): un tamaño o una alineación nuevos en `core` no compilan
// hasta que tengan aquí sus tokens.
const sizeStyles = {
  sm: (t) => ({ rowHeight: t.size.control.sm, paddingX: t.space[3], paddingY: t.space[1] }),
  md: (t) => ({ rowHeight: t.size.control.md, paddingX: t.space[4], paddingY: t.space[2] }),
} satisfies Record<TableSize, (t: Theme) => SizeStyle>;

const alignStyles = {
  start: { items: 'flex-start', text: 'left' },
  center: { items: 'center', text: 'center' },
  end: { items: 'flex-end', text: 'right' },
} satisfies Record<TableAlign, AlignStyle>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  // `overflow` recorta las esquinas de la cabecera y de la última fila.
  root: { alignSelf: 'stretch', overflow: 'hidden' },
  // Sin esto, un `ScrollView` horizontal crece para ocupar toda la altura disponible.
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row' },
  // Cada celda mide el ancho de su columna, ni más ni menos.
  cell: { justifyContent: 'center', flexGrow: 0, flexShrink: 0 },
  sort: { flexDirection: 'row', alignItems: 'center', flexGrow: 0, flexShrink: 0 },
  // En una columna alineada al final el icono va delante, para que el texto de la
  // cabecera siga alineado con los valores.
  sortEnd: { flexDirection: 'row-reverse' },
  sortCenter: { justifyContent: 'center' },
  stretch: { alignSelf: 'stretch' },
  empty: { alignItems: 'center' },
});

// Anchos de los huecos de carga, para que no parezcan una cuadrícula.
const SKELETON_WIDTHS = ['70%', '50%', '85%', '60%'] as const;

/** El texto de una celda, si su contenido es solo texto o números. */
function textOf(content: ReactNode): string | undefined {
  const parts = Children.toArray(content);
  if (parts.length === 0) return undefined;
  return parts.every((part) => typeof part === 'string' || typeof part === 'number')
    ? parts.join('')
    : undefined;
}

interface SortHeaderProps {
  header: string;
  align: TableAlign;
  direction: SortDirection | undefined;
  /** Lo que el lector de pantalla dice del sentido, si la app lo ha dado. */
  directionLabel: string | undefined;
  /** Tamaño y relleno de la celda. */
  cell: ViewStyle;
  text: TextStyle;
  hitSlop: number;
  onPress: () => void;
}

/** La cabecera de una columna ordenable: un botón que ocupa la celda entera. */
function SortHeader({
  header,
  align,
  direction,
  directionLabel,
  cell,
  text,
  hitSlop,
  onPress,
}: SortHeaderProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const sorted = direction !== undefined;
  // La columna por la que se ordena destaca sobre las demás.
  const color = sorted ? 'primary' : 'secondary';
  // Anillo de foco para teclado físico o mando, hacia dentro: la tabla recorta lo que sobresale.
  const focusRing: ViewStyle = {
    outlineStyle: 'solid',
    outlineColor: t.color.border.focus,
    outlineWidth: t.borderWidth.thick,
    outlineOffset: -t.borderWidth.thick,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={header}
      accessibilityState={{ selected: sorted }}
      accessibilityValue={directionLabel === undefined ? undefined : { text: directionLabel }}
      hitSlop={{ top: hitSlop, bottom: hitSlop }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.sort,
        align === 'end' && styles.sortEnd,
        align === 'center' && styles.sortCenter,
        cell,
        { gap: t.space[1], backgroundColor: pressed ? t.color.bg.muted : 'transparent' },
        focused && focusRing,
      ]}
    >
      <Text style={[text, { color: t.color.text[color] }]}>{header}</Text>
      <Icon
        name={direction === undefined ? unsortedIcon : sortIcon[direction]}
        size="sm"
        color={color}
      />
    </Pressable>
  );
}

/**
 * Una tabla de datos (ADR-045). React Native no tiene tablas: es una rejilla de vistas en
 * la que cada columna mide lo mismo en todas las filas, y que se desplaza en horizontal si
 * no cabe. Pinta las filas que recibe y en ese orden; ordenar y paginar es cosa de la app.
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
  sortDirectionLabels,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys,
  onSelectedKeysChange,
  selectAllLabel,
  getRowSelectionLabel,
  loading = false,
  loadingRowCount = 5,
  empty,
  style,
  testID,
}: TableNativeProps<Row>) {
  const t = useTheme();
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

  const dimensions = sizeStyles[size](t);
  // La columna de casillas mide lo que la casilla más su relleno inicial; de la columna
  // siguiente la separa el relleno de esta.
  const selectionWidth = selectable ? t.space[5] + dimensions.paddingX : 0;

  // El ancho de cada columna se calcula aquí y se da a cada celda. No se deja a flexbox:
  // dentro de un `ScrollView` horizontal el ancho de una fila no está definido, y ahí cada
  // celda mediría lo que su contenido y las columnas no quedarían alineadas entre filas.
  // Hace falta saber cuánto se ve: se mide antes del primer pintado y en cada cambio de tamaño.
  const root = useRef<View>(null);
  const [rootWidth, setRootWidth] = useState(0);
  useLayoutEffect(() => {
    root.current?.measure((_x, _y, width) => {
      if (width > 0) setRootWidth(width);
    });
  }, []);
  const visible = Math.max(0, rootWidth - t.borderWidth.thin * 2);
  const widths = getColumnWidths(columns, {
    available: visible - selectionWidth,
    // Sin `width` ni `minWidth`, una columna no baja de aquí (128 pt): cabe entera una
    // cabecera de una palabra, que con la tipografía de etiqueta ocupa más que sus valores.
    defaultMinWidth: t.space[24] + t.space[8],
  });
  const gridWidth = widths.reduce((total, width) => total + width, selectionWidth);

  const cellBox: ViewStyle = {
    minHeight: dimensions.rowHeight,
    paddingHorizontal: dimensions.paddingX,
    paddingVertical: dimensions.paddingY,
  };
  const selectionBox: ViewStyle = {
    width: selectionWidth,
    minHeight: dimensions.rowHeight,
    paddingLeft: dimensions.paddingX,
    paddingVertical: dimensions.paddingY,
  };
  const separator: ViewStyle = {
    borderTopWidth: t.borderWidth.thin,
    borderTopColor: t.color.border.default,
  };

  const cellText: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    fontWeight: t.font.weight.regular,
    color: t.color.text.primary,
  };
  const sans = t.font.family.sans;
  if (sans !== undefined) cellText.fontFamily = sans;

  // La cabecera usa la tipografía de etiqueta de `Text`, leída del mismo mapa de `core`.
  const label = textVariantStyles.label;
  const headerText: TextStyle = {
    fontSize: t.font.size[label.size],
    lineHeight: t.font.lineHeight[label.size],
    fontWeight: t.font.weight[label.weight],
    color: t.color.text.secondary,
  };
  const headerFamily = t.font.family[label.family];
  if (headerFamily !== undefined) headerText.fontFamily = headerFamily;
  if (label.uppercase) headerText.textTransform = 'uppercase';
  if (label.letterSpacing !== undefined) headerText.letterSpacing = label.letterSpacing;

  // El área táctil de una cabecera ordenable nunca baja de la altura del control por defecto.
  const hitSlop = Math.max(0, (t.size.control.md - dimensions.rowHeight) / 2);

  const keys = rows.map(getRowKey);
  const chosen = new Set(selected);
  const selection = getSelectionState(keys, selected);
  const skeletonCount = rows.length > 0 ? rows.length : Math.max(1, loadingRowCount);
  const hasEmpty = empty !== undefined && empty !== null;
  const emptyText = textOf(empty);

  return (
    <View
      ref={root}
      onLayout={(event) => setRootWidth(event.nativeEvent.layout.width)}
      style={[
        styles.root,
        {
          borderWidth: t.borderWidth.thin,
          borderColor: t.color.border.default,
          borderRadius: t.radius.lg,
          backgroundColor: t.color.bg.surface,
        },
        style,
      ]}
      testID={testID}
    >
      <ScrollView
        horizontal
        // Informativo: los lectores de pantalla no recorren esto como una tabla, por eso
        // cada celda de texto lleva el nombre de su columna.
        role="table"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ busy: loading }}
        style={styles.scroll}
      >
        {/* Como mínimo ocupa lo que se ve; si sus columnas piden más, se desplaza. */}
        <View style={{ width: gridWidth, minWidth: visible }}>
          <View style={[styles.row, { backgroundColor: t.color.bg.subtle }]}>
            {selectable ? (
              <View style={[styles.cell, selectionBox]}>
                <Checkbox
                  checked={selection === 'all'}
                  indeterminate={selection === 'some'}
                  disabled={loading || rows.length === 0}
                  accessibilityLabel={selectAllLabel}
                  onCheckedChange={() => setSelected(toggleAllSelected(keys, selected))}
                />
              </View>
            ) : null}
            {columns.map((column, index) => {
              const align = column.align ?? 'start';
              const width = { width: widths[index] };
              const direction =
                currentSort?.column === column.key ? currentSort.direction : undefined;
              return column.sortable ? (
                <SortHeader
                  key={column.key}
                  header={column.header}
                  align={align}
                  direction={direction}
                  directionLabel={
                    direction === undefined ? undefined : sortDirectionLabels?.[direction]
                  }
                  cell={{ ...cellBox, ...width }}
                  text={headerText}
                  hitSlop={hitSlop}
                  onPress={() => setSort(getNextSort(currentSort, column.key))}
                />
              ) : (
                <View
                  key={column.key}
                  style={[styles.cell, cellBox, width, { alignItems: alignStyles[align].items }]}
                >
                  {/* Oculta, la cabecera no ocupa sitio: su nombre lo llevan las celdas. */}
                  {column.headerHidden ? null : (
                    <Text style={[headerText, { textAlign: alignStyles[align].text }]}>
                      {column.header}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {loading ? (
            Array.from({ length: skeletonCount }, (_, rowIndex) => (
              <View key={rowIndex} style={[styles.row, separator]}>
                {selectable ? <View style={selectionBox} /> : null}
                {columns.map((column, columnIndex) => (
                  <View
                    key={column.key}
                    style={[styles.cell, cellBox, { width: widths[columnIndex] }]}
                  >
                    <Skeleton
                      variant="bodySmall"
                      width={SKELETON_WIDTHS[(rowIndex + columnIndex) % SKELETON_WIDTHS.length]}
                      style={styles.stretch}
                    />
                  </View>
                ))}
              </View>
            ))
          ) : rows.length === 0 ? (
            hasEmpty ? (
              <View
                style={[
                  styles.empty,
                  separator,
                  { paddingVertical: t.space[8], paddingHorizontal: dimensions.paddingX },
                ]}
              >
                {emptyText === undefined ? (
                  empty
                ) : (
                  <Text style={[cellText, { color: t.color.text.secondary, textAlign: 'center' }]}>
                    {emptyText}
                  </Text>
                )}
              </View>
            ) : null
          ) : (
            rows.map((row, rowIndex) => {
              const key = keys[rowIndex] ?? '';
              const isSelected = selectable && chosen.has(key);
              return (
                <View
                  key={key}
                  style={[
                    styles.row,
                    separator,
                    isSelected && { backgroundColor: t.color.accent.bg },
                  ]}
                >
                  {selectable ? (
                    <View style={[styles.cell, selectionBox]}>
                      <Checkbox
                        checked={isSelected}
                        accessibilityLabel={getRowSelectionLabel?.(row)}
                        onCheckedChange={() => setSelected(toggleSelectedKey(selected, key))}
                      />
                    </View>
                  ) : null}
                  {columns.map((column, index) => {
                    const align = alignStyles[column.align ?? 'start'];
                    const content = column.cell(row);
                    const text = textOf(content);
                    return (
                      <View
                        key={column.key}
                        style={[
                          styles.cell,
                          cellBox,
                          { width: widths[index], alignItems: align.items },
                        ]}
                      >
                        {text === undefined ? (
                          content
                        ) : (
                          // No hay rol de tabla que anuncie la cabecera de una celda: cada
                          // celda de texto dice a qué columna pertenece.
                          <Text
                            style={[cellText, { textAlign: align.text }]}
                            accessibilityLabel={`${column.header}, ${text}`}
                          >
                            {text}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
