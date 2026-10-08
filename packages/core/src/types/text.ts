import type { ReactNode } from 'react';
import type { Theme } from '@satellatickets/tokens';
import { themes } from '@satellatickets/tokens';

export const textVariants = [
  'hero',
  'display',
  'title',
  'heading',
  'subheading',
  'body',
  'bodySmall',
  'label',
  'caption',
  'code',
] as const;
export type TextVariant = (typeof textVariants)[number];

export type TextColorToken = keyof Theme['color']['text'];
export const textColors = Object.keys(themes.light.color.text) as TextColorToken[];

export const textAligns = ['left', 'center', 'right'] as const;
export type TextAlign = (typeof textAligns)[number];

/** Tokens que componen una variante tipográfica; ambas vistas los leen del tema. */
export interface TextVariantStyle {
  family: keyof Theme['font']['family'];
  /** Tamaño; `font.lineHeight` comparte las mismas claves (lo comprueba el typecheck de las vistas). */
  size: keyof Theme['font']['size'];
  weight: keyof Theme['font']['weight'];
  uppercase?: boolean;
  /** Espaciado entre letras en px. */
  letterSpacing?: number;
  /** Nivel de encabezado semántico (h1–h4) si la variante es un título. */
  headingLevel?: 1 | 2 | 3 | 4;
}

/** Escala tipográfica de Satella: Unbounded para titulares, Hanken Grotesk para texto, IBM Plex Mono para etiquetas. */
export const textVariantStyles: Readonly<Record<TextVariant, TextVariantStyle>> = {
  hero: { family: 'display', size: 'hero', weight: 'bold', headingLevel: 1 },
  display: { family: 'display', size: 'display', weight: 'bold', headingLevel: 1 },
  title: { family: 'display', size: 'xxl', weight: 'bold', headingLevel: 2 },
  heading: { family: 'sans', size: 'xl', weight: 'semibold', headingLevel: 3 },
  subheading: { family: 'sans', size: 'lg', weight: 'semibold', headingLevel: 4 },
  body: { family: 'sans', size: 'md', weight: 'regular' },
  bodySmall: { family: 'sans', size: 'sm', weight: 'regular' },
  label: { family: 'mono', size: 'xs', weight: 'medium', uppercase: true, letterSpacing: 1.2 },
  caption: { family: 'sans', size: 'xs', weight: 'regular' },
  code: { family: 'mono', size: 'sm', weight: 'regular' },
};

export interface TextProps {
  variant?: TextVariant | undefined;
  color?: TextColorToken | undefined;
  align?: TextAlign | undefined;
  /** Una sola línea con puntos suspensivos. */
  truncate?: boolean | undefined;
  testID?: string | undefined;
  children?: ReactNode;
}
