import type { ReactNode } from 'react';
import type { Theme } from '@satellatickets/tokens';
import { themes } from '@satellatickets/tokens';

export type SpaceToken = keyof Theme['space'];
export type RadiusToken = keyof Theme['radius'];
export type ShadowToken = keyof Theme['shadow'];
export type BackgroundToken = keyof Theme['color']['bg'];
export type BorderColorToken = keyof Theme['color']['border'];

/** Constantes para `argTypes` y matrices de historias (ADR-009). */
export const spaceTokens = Object.keys(themes.light.space).map(Number) as SpaceToken[];
export const radiusTokens = Object.keys(themes.light.radius) as RadiusToken[];
export const shadowTokens = Object.keys(themes.light.shadow) as ShadowToken[];
export const backgroundTokens = Object.keys(themes.light.color.bg) as BackgroundToken[];
export const borderColorTokens = Object.keys(themes.light.color.border) as BorderColorToken[];

/** Contenedor base: relleno, fondo, radio, borde y sombra, siempre con tokens. */
export interface BoxProps {
  padding?: SpaceToken | undefined;
  paddingX?: SpaceToken | undefined;
  paddingY?: SpaceToken | undefined;
  background?: BackgroundToken | undefined;
  radius?: RadiusToken | undefined;
  /** Borde fino (`borderWidth.thin`) con el color indicado. */
  borderColor?: BorderColorToken | undefined;
  shadow?: ShadowToken | undefined;
  flex?: number | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  children?: ReactNode;
}
