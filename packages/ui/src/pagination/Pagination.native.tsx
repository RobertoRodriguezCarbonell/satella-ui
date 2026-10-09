import {
  clampPage,
  getPaginationItems,
  useControllableState,
  useTheme,
  type PaginationSize,
} from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { variantStyles } from '../button/Button';
import { Icon } from '../icon/Icon';
import { IconButton } from '../icon-button/IconButton';
import type { PaginationNativeProps } from './Pagination.types';

export type { PaginationNativeProps } from './Pagination.types';

// Mapa exhaustivo (ADR-014): un tamaño nuevo en `core` no compila hasta que tenga aquí
// su token. Cada botón es un cuadrado del alto de un control.
const sizeStyles = {
  sm: (t) => t.size.control.sm,
  md: (t) => t.size.control.md,
} satisfies Record<PaginationSize, (t: Theme) => number>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  // Si no caben en una línea, por ejemplo en un móvil, siguen en la siguiente.
  root: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  page: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ellipsis: { alignItems: 'center', justifyContent: 'center' },
});

// Decorativo: los lectores de pantalla lo ignoran.
const hiddenFromScreenReaders = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

interface PageButtonProps {
  page: number;
  label: string;
  current: boolean;
  disabled: boolean;
  /** Lado del botón. Un número de tres cifras lo ensancha. */
  side: number;
  onPress: () => void;
}

/** El botón de una página. La actual va teñida con el color de acento. */
function PageButton({ page, label, current, disabled, side, onPress }: PageButtonProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  // Las demás son botones `ghost`, con los mismos tokens que `Button`.
  const ghost = variantStyles.ghost(t);

  const container: ViewStyle = {
    minWidth: side,
    height: side,
    paddingHorizontal: t.space[2],
    borderRadius: t.radius.md,
  };
  // Anillo de foco para teclado físico o mando, equivalente a `:focus-visible` en web.
  const focusRing: ViewStyle = {
    outlineStyle: 'solid',
    outlineColor: t.color.border.focus,
    outlineWidth: t.borderWidth.thick,
    outlineOffset: t.borderWidth.thick,
  };
  const text: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    fontWeight: current ? t.font.weight.semibold : t.font.weight.medium,
    color: disabled
      ? t.color.text.disabled
      : current
        ? t.color.accent.text
        : t.color.text[ghost.content],
    // Cifras del mismo ancho, para que los botones no bailen al pasar de página.
    fontVariant: ['tabular-nums'],
  };
  const family = t.font.family.sans;
  if (family !== undefined) text.fontFamily = family;

  // El área táctil nunca baja de la altura del control por defecto (44 pt).
  const hitSlop = Math.max(0, (t.size.control.md - side) / 2);

  function background(pressed: boolean): string {
    if (current) return disabled ? t.color.action.disabled : t.color.accent.bg;
    if (disabled) return ghost.disabled;
    return pressed ? ghost.pressed : ghost.background;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: current, disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.page,
        container,
        { backgroundColor: background(pressed) },
        focused && focusRing,
      ]}
    >
      <Text style={text}>{page}</Text>
    </Pressable>
  );
}

/**
 * Moverse entre las páginas de un listado (ADR-045): anterior, siguiente y los números,
 * resumidos alrededor de la página actual.
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
  style,
  testID,
}: PaginationNativeProps) {
  const t = useTheme();
  const [value, setPage] = useControllableState({
    value: page,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });
  const current = clampPage(value, pageCount);
  const items = getPaginationItems({ page: current, pageCount, siblingCount });
  const side = sizeStyles[size](t);

  return (
    <View
      role="navigation"
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, { gap: t.space[1] }, style]}
      testID={testID}
    >
      <IconButton
        icon="chevron-left"
        label={previousLabel}
        size={size}
        disabled={disabled || current <= 1}
        onPress={() => setPage(current - 1)}
      />
      {items.map((item) =>
        item.type === 'ellipsis' ? (
          // El salto ocupa lo mismo que un botón, para que la fila no cambie de ancho.
          <View
            key={item.position}
            style={[styles.ellipsis, { width: side, height: side }]}
            {...hiddenFromScreenReaders}
          >
            <Icon name="ellipsis" size="sm" color="muted" />
          </View>
        ) : (
          <PageButton
            key={item.page}
            page={item.page}
            label={getPageLabel?.(item.page) ?? String(item.page)}
            current={item.page === current}
            disabled={disabled}
            side={side}
            onPress={() => setPage(item.page)}
          />
        ),
      )}
      <IconButton
        icon="chevron-right"
        label={nextLabel}
        size={size}
        disabled={disabled || current >= pageCount}
        onPress={() => setPage(current + 1)}
      />
    </View>
  );
}
