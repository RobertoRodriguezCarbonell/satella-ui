import { useTheme } from '@satellatickets/core';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { feedbackIcon, feedbackUrgent } from '../_internal/feedback';
import { renderLabel } from '../_internal/label';
import { Icon } from '../icon/Icon';
import { IconButton } from '../icon-button/IconButton';
import type { AlertNativeProps } from './Alert.types';

export type { AlertNativeProps } from './Alert.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'stretch' },
  message: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start' },
  icon: { justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1, minWidth: 0 },
  close: { flexShrink: 0 },
});

export function Alert({
  tone = 'info',
  title,
  onClose,
  closeLabel,
  style,
  testID,
  children,
}: AlertNativeProps) {
  const t = useTheme();
  const colors = t.color.feedback[tone];
  const hasDescription = children !== undefined && children !== null;
  const titleLine = t.font.lineHeight.md;
  const descriptionLine = t.font.lineHeight.sm;

  const container: ViewStyle = {
    gap: t.space[3],
    paddingVertical: t.space[3],
    paddingHorizontal: t.space[4],
    borderWidth: t.borderWidth.thin,
    borderRadius: t.radius.md,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  };
  const titleStyle: TextStyle = {
    fontSize: t.font.size.md,
    lineHeight: titleLine,
    fontWeight: t.font.weight.semibold,
    color: colors.text,
  };
  const descriptionStyle: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: descriptionLine,
    fontWeight: t.font.weight.regular,
    color: colors.text,
  };
  const family = t.font.family.sans;
  if (family !== undefined) {
    titleStyle.fontFamily = family;
    descriptionStyle.fontFamily = family;
  }
  // El botón de cierre se centra con la primera línea y no aumenta la altura del aviso.
  const closeOffset = (titleLine - t.size.control.sm) / 2;

  return (
    <View style={[styles.root, container, style]} testID={testID}>
      {/*
        El icono y el texto forman un solo elemento para el lector de pantalla, que lo
        anuncia como alerta. El botón de cierre queda fuera para poder alcanzarlo.
      */}
      <View
        accessible
        accessibilityRole="alert"
        // `assertive` interrumpe al lector de pantalla; `polite` espera a que termine de leer.
        accessibilityLiveRegion={feedbackUrgent[tone] ? 'assertive' : 'polite'}
        style={[styles.message, { gap: t.space[3] }]}
      >
        {/* El icono refuerza el color: el tono no depende solo de él. */}
        <View style={[styles.icon, { height: titleLine }]}>
          <Icon name={feedbackIcon[tone]} size="md" color={tone} />
        </View>
        <View style={styles.content}>
          {title === undefined ? null : <Text style={titleStyle}>{title}</Text>}
          {hasDescription ? (
            // Sin título, la descripción ocupa la primera línea y se alinea con el icono.
            <View
              style={
                title === undefined ? { paddingVertical: (titleLine - descriptionLine) / 2 } : null
              }
            >
              {renderLabel(children, descriptionStyle)}
            </View>
          ) : null}
        </View>
      </View>
      {onClose === undefined ? null : (
        <IconButton
          icon="x"
          label={closeLabel}
          size="sm"
          variant="ghost"
          onPress={onClose}
          style={[styles.close, { marginVertical: closeOffset, marginRight: -t.space[2] }]}
        />
      )}
    </View>
  );
}
