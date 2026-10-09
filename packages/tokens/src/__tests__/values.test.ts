/** Conversores de valores DTCG a CSS y React Native. */
import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToRgba, rgbaToHex } from '../pipeline/color.ts';
import type { ResolvedToken } from '../pipeline/model.ts';
import { cssVariableName } from '../pipeline/naming.ts';
import {
  dimensionToCss,
  fontFamilyToCss,
  fontFamilyToNative,
  fontWeightToNumber,
  shadowToCss,
  shadowToNative,
  toCssValue,
  toNativeValue,
} from '../pipeline/values.ts';

function token(
  partial: Partial<ResolvedToken> & Pick<ResolvedToken, 'type' | 'value'>,
): ResolvedToken {
  return { name: 'x', path: ['x'], isSource: true, filePath: 'x.tokens.json', ...partial };
}

describe('colores', () => {
  it('emite hex de 6 dígitos para colores opacos y de 8 con alpha', () => {
    expect(rgbaToHex({ r: 1, g: 0, b: 1, a: 1 })).toBe('#ff00ff');
    expect(rgbaToHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('#00000080');
    expect(hexToRgba('#00000080').a).toBeCloseTo(0.5, 2);
  });

  it('calcula el contraste de la norma', () => {
    const white = hexToRgba('#ffffff');
    const black = hexToRgba('#000000');
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(hexToRgba('#767676'), white)).toBeCloseTo(4.54, 1);
  });

  it('compone un primer plano con alpha sobre el fondo antes de medir', () => {
    const white = hexToRgba('#ffffff');
    expect(contrastRatio({ r: 0, g: 0, b: 0, a: 0.5 }, white)).toBeLessThan(21);
  });
});

describe('dimensiones', () => {
  it('convierte px a rem en CSS y deja números en nativo', () => {
    const t = token({ type: 'dimension', value: { value: 12, unit: 'px' } });
    expect(toCssValue(t)).toBe('0.75rem');
    expect(toNativeValue(t)).toBe(12);
  });

  it('respeta la extensión css.unit = px y el cero sin unidad', () => {
    expect(dimensionToCss({ value: 9999, unit: 'px' }, { css: { unit: 'px' } })).toBe('9999px');
    expect(dimensionToCss({ value: 0, unit: 'px' })).toBe('0');
    expect(dimensionToCss({ value: 1.5, unit: 'rem' })).toBe('1.5rem');
  });

  it('convierte rem a puntos en nativo', () => {
    expect(toNativeValue(token({ type: 'dimension', value: { value: 1.5, unit: 'rem' } }))).toBe(
      24,
    );
  });
});

describe('tipografía', () => {
  it('entrecomilla las familias con espacios en CSS', () => {
    expect(fontFamilyToCss(['Segoe UI', 'Roboto', 'sans-serif'])).toBe(
      '"Segoe UI", Roboto, sans-serif',
    );
    expect(fontFamilyToCss('Inter')).toBe('Inter');
  });

  it('en nativo usa la fuente del sistema si la pila empieza por una genérica', () => {
    expect(fontFamilyToNative(['system-ui', 'Segoe UI'])).toBeUndefined();
    expect(fontFamilyToNative(['Inter', 'sans-serif'])).toBe('Inter');
    expect(
      fontFamilyToNative(['ui-monospace', 'Menlo'], { native: { fontFamily: 'monospace' } }),
    ).toBe('monospace');
    expect(fontFamilyToNative(['Inter'], { native: { fontFamily: null } })).toBeUndefined();
  });

  it('acepta pesos numéricos y alias de la spec', () => {
    expect(fontWeightToNumber(600)).toBe(600);
    expect(fontWeightToNumber('semi-bold')).toBe(600);
    expect(() => fontWeightToNumber('grueso')).toThrow();
    expect(toNativeValue(token({ type: 'fontWeight', value: 'bold' }))).toBe('700');
    expect(toCssValue(token({ type: 'fontWeight', value: 'bold' }))).toBe('700');
  });
});

describe('duraciones y números', () => {
  it('emite ms en nativo y la unidad original en CSS', () => {
    expect(toCssValue(token({ type: 'duration', value: { value: 0.3, unit: 's' } }))).toBe('0.3s');
    expect(toNativeValue(token({ type: 'duration', value: { value: 0.3, unit: 's' } }))).toBe(300);
    expect(toNativeValue(token({ type: 'number', value: 1300 }))).toBe(1300);
    expect(toCssValue(token({ type: 'number', value: 1300 }))).toBe('1300');
  });
});

describe('curvas', () => {
  it('emite `cubic-bezier()` en CSS y los cuatro números en nativo', () => {
    const curve = token({ type: 'cubicBezier', value: [0.4, 0, 0.2, 1] });
    expect(toCssValue(curve)).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(toNativeValue(curve)).toEqual([0.4, 0, 0.2, 1]);
  });
});

describe('sombras', () => {
  const layer = {
    color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1, hex: '#000000' },
    offsetX: { value: 0, unit: 'px' as const },
    offsetY: { value: 4, unit: 'px' as const },
    blur: { value: 6, unit: 'px' as const },
    spread: { value: -1, unit: 'px' as const },
  };

  it('produce box-shadow en px y boxShadow nativo', () => {
    expect(shadowToCss([layer, { ...layer, inset: true }])).toBe(
      '0 4px 6px -1px #0000001a, inset 0 4px 6px -1px #0000001a',
    );
    expect(shadowToNative(layer)).toEqual([
      { offsetX: 0, offsetY: 4, blurRadius: 6, spreadDistance: -1, color: '#0000001a' },
    ]);
  });
});

describe('nombres', () => {
  it('convierte la ruta a kebab-case para CSS', () => {
    expect(cssVariableName(['color', 'action', 'primaryHover'])).toBe(
      '--color-action-primary-hover',
    );
    expect(cssVariableName(['zIndex', 'modal'])).toBe('--z-index-modal');
    expect(cssVariableName(['space', '4'])).toBe('--space-4');
  });
});
