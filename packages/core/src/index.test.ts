import { describe, expect, it } from 'vitest';

import * as core from './index';

describe('API pública de core', () => {
  it('exporta exactamente estos nombres en runtime', () => {
    // Quitar o renombrar uno es un breaking change (ADR-025): este test obliga a hacerlo a propósito.
    expect(Object.keys(core).sort()).toEqual([
      'UIContext',
      'backgroundTokens',
      'badgeVariants',
      'borderColorTokens',
      'buttonIconSize',
      'buttonVariants',
      'createUIContextValue',
      'iconButtonIconSize',
      'iconSizePx',
      'iconSizes',
      'linkUnderlines',
      'mergeTheme',
      'radiusTokens',
      'resolveColorScheme',
      'resolveTheme',
      'shadowTokens',
      'spaceTokens',
      'spinnerSizePx',
      'spinnerSizes',
      'stackAligns',
      'stackDirections',
      'stackJustifies',
      'textAligns',
      'textColors',
      'textVariantStyles',
      'textVariants',
      'themeModes',
      'useBrand',
      'useButton',
      'useColorScheme',
      'useLink',
      'useTheme',
      'useUIContext',
    ]);
  });
});

describe('contrato de Button', () => {
  it('define las variantes y tamaños del ROADMAP', () => {
    expect(core.buttonVariants.variant).toEqual(['primary', 'secondary', 'ghost', 'danger']);
    expect(core.buttonVariants.size).toEqual(['sm', 'md', 'lg']);
  });

  it('asigna a cada tamaño de botón un tamaño de icono existente', () => {
    for (const size of core.buttonVariants.size) {
      expect(core.iconSizes).toContain(core.buttonIconSize[size]);
    }
  });
});

describe('contrato de IconButton', () => {
  it('asigna a cada tamaño de botón un tamaño de icono existente', () => {
    for (const size of core.buttonVariants.size) {
      expect(core.iconSizes).toContain(core.iconButtonIconSize[size]);
    }
  });
});

describe('contrato de Spinner', () => {
  it('comparte la escala de Icon', () => {
    expect(core.spinnerSizes).toBe(core.iconSizes);
    expect(core.spinnerSizePx).toBe(core.iconSizePx);
  });
});
