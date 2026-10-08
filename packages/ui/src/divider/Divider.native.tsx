import { useTheme, type DividerOrientation } from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import type { DividerNativeProps } from './Divider.types';

export type { DividerNativeProps } from './Divider.types';

// Mapa exhaustivo (ADR-014): una orientación nueva en `core` no compila hasta que
// tenga aquí su forma.
const orientationStyle = {
  horizontal: (t) => ({ alignSelf: 'stretch', height: t.borderWidth.thin }),
  // Ocupa la altura de la fila que lo contiene.
  vertical: (t) => ({ alignSelf: 'stretch', width: t.borderWidth.thin }),
} satisfies Record<DividerOrientation, (t: Theme) => ViewStyle>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { flexShrink: 0 },
});

/** En nativo es decorativo: los lectores de pantalla no anuncian separadores. */
export function Divider({ orientation = 'horizontal', style, testID }: DividerNativeProps) {
  const t = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.root,
        orientationStyle[orientation](t),
        { backgroundColor: t.color.border.default },
        style,
      ]}
      testID={testID}
    />
  );
}
