/**
 * Conversión de colores DTCG (sRGB) y cálculo de contraste WCAG 2.x.
 * Sin dependencias: la paleta se define en sRGB y basta con la fórmula de la norma.
 */
import type { DtcgColorValue } from './model.ts';

/** Color sRGB con canales en [0, 1]. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function component(value: number | 'none' | undefined): number {
  if (value === undefined || value === 'none') return 0;
  return Math.min(1, Math.max(0, value));
}

export function parseColor(value: DtcgColorValue, name = 'color'): Rgba {
  if (value.colorSpace !== 'srgb') {
    throw new Error(
      `${name}: solo se soporta el espacio de color "srgb" (recibido "${value.colorSpace}").`,
    );
  }
  if (value.components.length !== 3) {
    throw new Error(`${name}: un color srgb necesita 3 componentes.`);
  }
  return {
    r: component(value.components[0]),
    g: component(value.components[1]),
    b: component(value.components[2]),
    a: value.alpha === undefined ? 1 : component(value.alpha),
  };
}

function channelToHex(channel: number): string {
  return Math.round(channel * 255)
    .toString(16)
    .padStart(2, '0');
}

/** `#rrggbb`, o `#rrggbbaa` si el color no es opaco. */
export function rgbaToHex({ r, g, b, a }: Rgba): string {
  const rgb = `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
  return a >= 1 ? rgb : `${rgb}${channelToHex(a)}`;
}

export function hexToRgba(hex: string): Rgba {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!match?.[1]) {
    throw new Error(`Hex inválido: "${hex}" (se esperaba #rrggbb o #rrggbbaa).`);
  }
  const rgb = match[1];
  const alpha = match[2];
  const channel = (offset: number) => parseInt(rgb.slice(offset, offset + 2), 16) / 255;
  return {
    r: channel(0),
    g: channel(2),
    b: channel(4),
    a: alpha === undefined ? 1 : parseInt(alpha, 16) / 255,
  };
}

export function colorToHex(value: DtcgColorValue, name?: string): string {
  return rgbaToHex(parseColor(value, name));
}

function linearize(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa según WCAG 2.x. */
export function relativeLuminance({ r, g, b }: Rgba): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Composición alpha de `fg` sobre `bg` (operador "over"). */
export function compositeOver(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (f: number, b: number) => (f * fg.a + b * bg.a * (1 - fg.a)) / a;
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a };
}

/**
 * Ratio de contraste WCAG entre un primer plano y un fondo. Si el primer plano
 * tiene transparencia se compone sobre el fondo antes de medir.
 */
export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const fg = foreground.a < 1 ? compositeOver(foreground, background) : foreground;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(background);
  const [light, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}
