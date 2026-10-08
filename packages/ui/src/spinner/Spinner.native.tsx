import { spinnerSizePx, useTheme } from '@satellatickets/core';
import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { Icon } from '../icon/Icon';
import type { SpinnerNativeProps } from './Spinner.types';

/**
 * Indicador de carga indeterminada. Versión mínima (ROADMAP Fase 3): el icono
 * `loader-circle` girando con `Animated` y el driver nativo, sin dependencias extra.
 * Con `label` es una barra de progreso indeterminada para los lectores de
 * pantalla; sin él, es decorativo.
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  label,
  style,
  testID,
}: SpinnerNativeProps) {
  const t = useTheme();
  const [rotation] = useState(() => new Animated.Value(0));
  // Una vuelta dura el doble de la transición lenta, igual que en web.
  const duration = t.duration.slow * 2;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation, duration]);

  const px = spinnerSizePx[size];
  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const accessibility =
    label === undefined
      ? {
          accessibilityElementsHidden: true,
          importantForAccessibility: 'no-hide-descendants' as const,
        }
      : {
          accessible: true,
          accessibilityRole: 'progressbar' as const,
          accessibilityLabel: label,
          accessibilityState: { busy: true },
        };

  return (
    <Animated.View
      style={[{ width: px, height: px, transform: [{ rotate }] }, style]}
      testID={testID}
      {...accessibility}
    >
      <Icon name="loader-circle" size={size} color={color} />
    </Animated.View>
  );
}
