import { textVariantStyles, useTheme, type SkeletonShape } from '@satellatickets/core';
import type { Theme } from '@satellatickets/tokens';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { useReducedMotion } from '../_internal/useReducedMotion';
import type { SkeletonNativeProps } from './Skeleton.types';

export type { SkeletonNativeProps } from './Skeleton.types';

// Mapa exhaustivo (ADR-014): una forma nueva en `core` no compila hasta que tenga
// aquí su radio.
const shapeRadius = {
  text: (t) => t.radius.xs,
  rectangle: (t) => t.radius.md,
  circle: (t) => t.radius.full,
} satisfies Record<SkeletonShape, (t: Theme) => number>;

// Estilos que no dependen del tema (ADR-008).
const styles = StyleSheet.create({
  bar: { overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});

// Decorativo: los lectores de pantalla lo ignoran.
const hiddenFromScreenReaders = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

/**
 * El hueco de un contenido que se está cargando. Late entre dos fondos del tema: una
 * capa con `bg.muted` aparece y desaparece sobre `bg.subtle`, con el driver nativo. Con
 * movimiento reducido se queda quieto.
 */
export function Skeleton({
  shape = 'text',
  width,
  height,
  variant = 'body',
  lines = 1,
  style,
  testID,
}: SkeletonNativeProps) {
  const t = useTheme();
  const reducedMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(1));
  const duration = t.duration.slow * 4;

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, duration, reducedMotion]);

  const radius = shapeRadius[shape](t);

  function bar(dimensions: ViewStyle, key?: number) {
    return (
      <View
        key={key}
        style={[
          styles.bar,
          { borderRadius: radius, backgroundColor: t.color.bg.subtle },
          dimensions,
        ]}
      >
        <Animated.View
          style={[styles.fill, { backgroundColor: t.color.bg.muted, opacity: pulse }]}
        />
      </View>
    );
  }

  if (shape === 'text') {
    const spec = textVariantStyles[variant];
    const fontSize = t.font.size[spec.size];
    // Cada línea mide de alto lo que la letra y ocupa lo que su interlineado.
    const marginVertical = (t.font.lineHeight[spec.size] - fontSize) / 2;
    const count = Math.max(1, lines);
    return (
      <View style={style} testID={testID} {...hiddenFromScreenReaders}>
        {Array.from({ length: count }, (_, index) =>
          bar(
            {
              height: fontSize,
              marginVertical,
              // Con varias líneas, la última es más corta, como el final de un párrafo.
              width: count > 1 && index === count - 1 ? '60%' : (width ?? '100%'),
            },
            index,
          ),
        )}
      </View>
    );
  }

  const fallback = t.size.control.md;
  const dimensions: ViewStyle =
    shape === 'circle'
      ? { width: width ?? height ?? fallback, height: height ?? fallback }
      : { width: width ?? '100%', height: height ?? fallback };
  // Un círculo con el ancho en porcentaje no tiene alto que copiar: usa el de por defecto.
  if (shape === 'circle' && height === undefined && typeof width === 'number') {
    dimensions.height = width;
  }

  return (
    <View style={style} testID={testID} {...hiddenFromScreenReaders}>
      {bar(dimensions)}
    </View>
  );
}
