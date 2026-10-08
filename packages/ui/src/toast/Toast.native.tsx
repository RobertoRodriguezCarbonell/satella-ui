import { useTheme } from '@satellatickets/core';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { feedbackIcon, feedbackUrgent } from '../_internal/feedback';
import { useReducedMotion } from '../_internal/useReducedMotion';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { IconButton } from '../icon-button/IconButton';
import type { ToastCardProps } from './Toast.types';

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', width: '100%' },
  message: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start' },
  icon: { justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
});

/**
 * La tarjeta de un toast. Es interna: los toasts se muestran con `useToast` y los
 * pinta `UIProvider` (ADR-039).
 */
export function Toast({ toast, onDismiss }: ToastCardProps) {
  const { tone, title, description, action, closeLabel } = toast;
  const t = useTheme();
  const reducedMotion = useReducedMotion();
  const [entered] = useState(() => new Animated.Value(0));
  const duration = reducedMotion ? 0 : t.duration.normal;

  // Aparece subiendo un poco, como en web.
  useEffect(() => {
    const animation = Animated.timing(entered, { toValue: 1, duration, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [entered, duration]);

  const titleLine = t.font.lineHeight.md;
  const container: ViewStyle = {
    gap: t.space[3],
    // No hay token de anchura: cuatro veces el espacio mayor da una tarjeta de lectura
    // cómoda en una tableta. En un móvil ocupa todo el ancho.
    maxWidth: t.space[24] * 4,
    paddingVertical: t.space[3],
    paddingHorizontal: t.space[4],
    borderWidth: t.borderWidth.thin,
    borderRadius: t.radius.lg,
    borderColor: t.color.border.strong,
    backgroundColor: t.color.bg.elevated,
    boxShadow: t.shadow.lg,
  };
  const titleStyle: TextStyle = {
    fontSize: t.font.size.md,
    lineHeight: titleLine,
    fontWeight: t.font.weight.medium,
    color: t.color.text.primary,
  };
  const descriptionStyle: TextStyle = {
    fontSize: t.font.size.sm,
    lineHeight: t.font.lineHeight.sm,
    color: t.color.text.secondary,
  };
  const family = t.font.family.sans;
  if (family !== undefined) {
    titleStyle.fontFamily = family;
    descriptionStyle.fontFamily = family;
  }
  // Los botones se centran con la primera línea y no aumentan la altura de la tarjeta.
  const actionsOffset = (titleLine - t.size.control.sm) / 2;

  return (
    <Animated.View
      style={[
        styles.root,
        container,
        {
          opacity: entered,
          transform: [
            {
              translateY: entered.interpolate({
                inputRange: [0, 1],
                outputRange: [t.space[2], 0],
              }),
            },
          ],
        },
      ]}
    >
      {/*
        El icono y el texto forman un solo elemento para el lector de pantalla. Los
        botones quedan fuera para poder alcanzarlos.
      */}
      <View
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion={feedbackUrgent[tone] ? 'assertive' : 'polite'}
        style={[styles.message, { gap: t.space[3] }]}
      >
        <View style={[styles.icon, { height: titleLine }]}>
          <Icon name={feedbackIcon[tone]} size="md" color={tone} />
        </View>
        <View style={styles.content}>
          <Text style={titleStyle}>{title}</Text>
          {description === undefined ? null : <Text style={descriptionStyle}>{description}</Text>}
        </View>
      </View>
      {action === undefined && closeLabel === undefined ? null : (
        <View
          style={[
            styles.actions,
            { gap: t.space[1], marginVertical: actionsOffset, marginRight: -t.space[2] },
          ]}
        >
          {action === undefined ? null : (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                action.onPress();
                onDismiss();
              }}
            >
              {action.label}
            </Button>
          )}
          {closeLabel === undefined ? null : (
            <IconButton icon="x" label={closeLabel} size="sm" variant="ghost" onPress={onDismiss} />
          )}
        </View>
      )}
    </Animated.View>
  );
}
