import type { IconProps as IconContract } from '@satellatickets/core';
import type { iconNames } from '@satellatickets/icons';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Nombres de icono disponibles. Se deriva aquí de `iconNames` (y no se reexporta el
 * tipo de `icons`) porque el empaquetador de declaraciones no resuelve reexports de
 * tipo del paquete interno al inlinarlo en `ui`.
 */
export type IconName = (typeof iconNames)[number];

/** Contrato de `Icon` con el conjunto de nombres del paquete de iconos. */
export type IconProps = IconContract<IconName>;

export interface IconWebProps extends IconProps {
  className?: string | undefined;
}

export interface IconNativeProps extends IconProps {
  style?: StyleProp<ViewStyle> | undefined;
}
