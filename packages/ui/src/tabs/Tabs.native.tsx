import { firstEnabledTab, useControllableState, useTheme } from '@satellatickets/core';
import { Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';

import { renderLabel } from '../_internal/label';
import { Icon } from '../icon/Icon';
import type { TabsNativeProps } from './Tabs.types';

export type { TabsNativeProps } from './Tabs.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  // Sin esto, un `ScrollView` horizontal crece para ocupar toda la altura disponible.
  list: { flexGrow: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

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
              style={({ pressed }) => [
                styles.tab,
                {
                  minHeight: t.size.control.md,
                  paddingHorizontal: t.space[3],
                  gap: t.space[2],
                  // El indicador ocupa siempre su sitio: al elegir una pestaña nada se mueve.
                  borderBottomWidth: t.borderWidth.thick,
                  borderBottomColor: isSelected ? t.color.action.primary : 'transparent',
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
      </ScrollView>
      {active?.content === undefined || active.content === null ? null : (
        <View style={{ paddingTop: t.space[4] }}>{renderLabel(active.content, panelText)}</View>
      )}
    </View>
  );
}
