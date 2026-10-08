import { useTheme, type ModalPresentation } from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ModalProps as RNModalProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { renderLabel } from '../_internal/label';
import { IconButton } from '../icon-button/IconButton';
import type { ModalDialogNativeProps } from './Modal.types';

interface PresentationStyle {
  /** Cómo entra la ventana. */
  animation: NonNullable<RNModalProps['animationType']>;
  /** Dónde se coloca la superficie dentro de la pantalla. */
  overlay: ViewStyle;
  surface: ViewStyle;
}

// Mapa exhaustivo (ADR-014): una presentación nueva en `core` no compila hasta que
// tenga aquí su forma.
const presentationStyle = {
  // Centrado, con margen alrededor.
  dialog: (t) => ({
    animation: 'fade',
    overlay: { justifyContent: 'center', padding: t.space[4] },
    surface: {
      // No hay token de anchura: cinco veces el espacio mayor, como en web.
      maxWidth: t.space[24] * 5,
      maxHeight: '90%',
      borderRadius: t.radius.xl,
      borderWidth: t.borderWidth.thin,
    },
  }),
  // Anclado al borde inferior, a todo el ancho.
  sheet: (t) => ({
    animation: 'slide',
    overlay: { justifyContent: 'flex-end' },
    surface: {
      maxHeight: '90%',
      borderTopLeftRadius: t.radius.xl,
      borderTopRightRadius: t.radius.xl,
      borderTopWidth: t.borderWidth.thin,
      // La librería no conoce la zona segura del dispositivo (ADR-039): deja un margen
      // fijo que salva la barra de inicio de un iPhone.
      paddingBottom: t.space[8],
    },
  }),
} satisfies Record<ModalPresentation, (t: Theme) => PresentationStyle>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  surface: { alignSelf: 'center', width: '100%', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  titles: { flex: 1, minWidth: 0 },
  close: { flexShrink: 0 },
  // Si el contenido no cabe, se desplaza él; la cabecera y el pie se quedan a la vista.
  body: { flexGrow: 0, flexShrink: 1 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
});

/**
 * La implementación que comparten `Modal` y `Sheet` (ADR-040): el `Modal` de React
 * Native, que pinta una ventana por encima de la app y avisa del botón atrás de Android.
 */
export function ModalDialog({
  presentation,
  open,
  onClose,
  title,
  description,
  closeLabel,
  dismissible = true,
  footer,
  style,
  testID,
  children,
}: ModalDialogNativeProps) {
  const t = useTheme();
  const shape: PresentationStyle = presentationStyle[presentation](t);
  const padding = t.space[5];
  const titleLine = t.font.lineHeight.lg;

  const titleStyle: TextStyle = {
    fontSize: t.font.size.lg,
    lineHeight: titleLine,
    fontWeight: t.font.weight.semibold,
    color: t.color.text.primary,
  };
  const descriptionStyle: TextStyle = {
    marginTop: t.space[1],
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    color: t.color.text.secondary,
  };
  const bodyText: TextStyle = {
    fontSize: t.font.size.md,
    lineHeight: t.font.lineHeight.md,
    color: t.color.text.primary,
  };
  const family = t.font.family.sans;
  if (family !== undefined) {
    titleStyle.fontFamily = family;
    descriptionStyle.fontFamily = family;
    bodyText.fontFamily = family;
  }

  const hasBody = children !== undefined && children !== null;
  const hasFooter = footer !== undefined && footer !== null;
  // El botón de cierre se centra con el título y no aumenta la altura de la cabecera.
  const closeOffset = (titleLine - t.size.control.sm) / 2;

  return (
    <RNModal
      visible={open}
      transparent
      animationType={shape.animation}
      statusBarTranslucent
      // El botón atrás de Android.
      onRequestClose={() => {
        if (dismissible) onClose();
      }}
      testID={testID === undefined ? undefined : `${testID}-modal`}
    >
      <View style={[styles.overlay, shape.overlay, { backgroundColor: t.color.bg.overlay }]}>
        {/* Tocar fuera lo cierra. Para los lectores de pantalla no es un control. */}
        <Pressable
          style={styles.backdrop}
          onPress={dismissible ? onClose : undefined}
          accessible={false}
          importantForAccessibility="no"
          testID={testID === undefined ? undefined : `${testID}-backdrop`}
        />
        <View
          // Los lectores de pantalla no salen del diálogo mientras está abierto.
          accessibilityViewIsModal
          style={[
            styles.surface,
            {
              padding,
              gap: t.space[4],
              borderColor: t.color.border.default,
              backgroundColor: t.color.bg.elevated,
              boxShadow: t.shadow.lg,
            },
            shape.surface,
            style,
          ]}
          testID={testID}
        >
          <View style={[styles.header, { gap: t.space[3] }]}>
            <View style={styles.titles}>
              <Text accessibilityRole="header" style={titleStyle}>
                {title}
              </Text>
              {description === undefined ? null : (
                <Text style={descriptionStyle}>{description}</Text>
              )}
            </View>
            {closeLabel === undefined ? null : (
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
          {hasBody ? (
            <ScrollView style={styles.body}>{renderLabel(children, bodyText)}</ScrollView>
          ) : null}
          {hasFooter ? <View style={[styles.footer, { gap: t.space[3] }]}>{footer}</View> : null}
        </View>
      </View>
    </RNModal>
  );
}
