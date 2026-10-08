import type { TabItem as TabItemContract, TabsProps as TabsContract } from '@satellatickets/core';
import type { CSSProperties } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { IconName } from '../icon/Icon.types';

/** Una pestaña, con el conjunto de iconos de la librería. */
export type TabItem = TabItemContract<IconName>;

/** Contrato de `Tabs` con el conjunto de iconos de la librería. */
export type TabsProps = TabsContract<IconName>;

/** Extensión solo web del contrato (ADR-009). */
export interface TabsWebProps extends TabsProps {
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** Extensión solo nativa del contrato. */
export interface TabsNativeProps extends TabsProps {
  style?: StyleProp<ViewStyle> | undefined;
}
