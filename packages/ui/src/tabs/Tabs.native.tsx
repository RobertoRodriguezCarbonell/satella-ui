import { firstEnabledTab, useControllableState, useTheme } from '@satellatickets/core';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from 'react-native';

import { renderLabel } from '../_internal/label';
import { useReducedMotion } from '../_internal/useReducedMotion';
import { Icon } from '../icon/Icon';
import type { TabsNativeProps } from './Tabs.types';

export type { TabsNativeProps } from './Tabs.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  // Sin esto, un `ScrollView` horizontal crece para ocupar toda la altura disponible.
  list: { flexGrow: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  // Mide un punto de ancho y se estira con `scaleX` desde su borde izquierdo: así su
  // ancho se anima igual que su posición, sin pasar por JavaScript en cada fotograma.
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 1,
    transformOrigin: 'left',
    pointerEvents: 'none',
  },
});

/** Dónde está una pestaña dentro de la lista. */
interface TabLayout {
  x: number;
  width: number;
}

/**
 * Pestañas subrayadas. Si no caben, la lista se desplaza en horizontal. En nativo no hay
 * teclado de flechas: cada pestaña se pulsa.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  accessibilityLabel,
  style,
  testID,
}: TabsNativeProps) {
  const t = useTheme();
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? firstEnabledTab(items) ?? '',
    onChange: onValueChange,
  });
  const active = items.find((item) => item.value === selected);
  const reducedMotion = useReducedMotion();
  // Con movimiento reducido la barra cambia de sitio sin deslizarse, como en web.
  const duration = reducedMotion ? 0 : t.duration.normal;

  // El indicador es una sola barra que se desliza hasta la pestaña elegida. Cada pestaña
  // avisa de dónde está al pintarse; hasta que la elegida lo hace, el indicador es su borde.
  const [layouts, setLayouts] = useState<Readonly<Record<string, TabLayout>>>({});
  const target = layouts[selected];
  const [bar, setBar] = useState<{ left: Animated.Value; width: Animated.Value }>();
  // Nace ya en su sitio, no llegando desde el borde.
  if (bar === undefined && target !== undefined) {
    setBar({ left: new Animated.Value(target.x), width: new Animated.Value(target.width) });
  }

  useEffect(() => {
    if (bar === undefined || target === undefined) return;
    const options = { duration, easing: Easing.out(Easing.cubic), useNativeDriver: true };
    const animation = Animated.parallel([
      Animated.timing(bar.left, { toValue: target.x, ...options }),
      Animated.timing(bar.width, { toValue: target.width, ...options }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [bar, target, duration]);

  const label: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    fontWeight: t.font.weight.medium,
  };
  const panelText: TextStyle = {
    fontSize: t.font.size.md,
    lineHeight: t.font.lineHeight.md,
    color: t.color.text.primary,
  };
  const family = t.font.family.sans;
  if (family !== undefined) {
    label.fontFamily = family;
    panelText.fontFamily = family;
  }

  return (
    <View style={[styles.root, style]} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.list,
          { borderBottomWidth: t.borderWidth.thin, borderBottomColor: t.color.border.default },
        ]}
        contentContainerStyle={{ gap: t.space[1] }}
      >
        {items.map((item) => {
          const isSelected = item.value === selected;
          const isDisabled = item.disabled === true;
          const color = isDisabled ? 'disabled' : isSelected ? 'primary' : 'secondary';
          return (
            <Pressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => setSelected(item.value)}
              onLayout={({ nativeEvent: { layout } }) => {
                setLayouts((current) => {
                  const known = current[item.value];
                  return known?.x === layout.x && known.width === layout.width
                    ? current
                    : { ...current, [item.value]: { x: layout.x, width: layout.width } };
                });
              }}
              style={({ pressed }) => [
                styles.tab,
                {
                  minHeight: t.size.control.md,
                  paddingHorizontal: t.space[3],
                  gap: t.space[2],
                  // El indicador ocupa siempre su sitio: al elegir una pestaña nada se mueve.
                  borderBottomWidth: t.borderWidth.thick,
                  borderBottomColor:
                    isSelected && bar === undefined ? t.color.action.primary : 'transparent',
                  borderTopLeftRadius: t.radius.sm,
                  borderTopRightRadius: t.radius.sm,
                  backgroundColor: pressed ? t.color.bg.muted : 'transparent',
                },
              ]}
            >
              {item.icon === undefined ? null : <Icon name={item.icon} size="sm" color={color} />}
              <Text style={[label, { color: t.color.text[color] }]}>{item.label}</Text>
            </Pressable>
          );
        })}
        {/* Va dentro de la lista: así se desplaza con las pestañas. */}
        {bar === undefined ? null : (
          <Animated.View
            style={[
              styles.indicator,
              {
                height: t.borderWidth.thick,
                backgroundColor: t.color.action.primary,
                transform: [{ translateX: bar.left }, { scaleX: bar.width }],
              },
            ]}
            testID={testID === undefined ? undefined : `${testID}-indicator`}
          />
        )}
      </ScrollView>
      {active?.content === undefined || active.content === null ? null : (
        <View style={{ paddingTop: t.space[4] }}>{renderLabel(active.content, panelText)}</View>
      )}
    </View>
  );
}
