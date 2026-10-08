import { describe, expect, it } from 'vitest';

import * as core from './index';

describe('API pública de core', () => {
  it('exporta exactamente estos nombres en runtime', () => {
    // Quitar o renombrar uno es un breaking change (ADR-025): este test obliga a hacerlo a propósito.
    expect(Object.keys(core).sort()).toEqual([
      'FormFieldContext',
      'TOAST_DEFAULT_DURATION',
      'TOAST_MAX_VISIBLE',
      'ToastContext',
      'UIContext',
      'backgroundTokens',
      'badgeVariants',
      'borderColorTokens',
      'buttonIconSize',
      'buttonVariants',
      'controlSizes',
      'createFormFieldValue',
      'createToastStore',
      'createUIContextValue',
      'feedbackTones',
      'iconButtonIconSize',
      'iconSizePx',
      'iconSizes',
      'inputIconSize',
      'inputTypes',
      'isFeedbackTone',
      'linkUnderlines',
      'mergeTheme',
      'radiusTokens',
      'resolveColorScheme',
      'resolveFormFieldControl',
      'resolveTheme',
      'shadowTokens',
      'skeletonShapes',
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
      'useControllableState',
      'useFormFieldControl',
      'useLink',
      'useTheme',
      'useToast',
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

describe('contrato de Input', () => {
  it('asigna a cada tamaño de campo un tamaño de icono existente', () => {
    for (const size of core.controlSizes) {
      expect(core.iconSizes).toContain(core.inputIconSize[size]);
    }
  });
});

describe('tonos de feedback', () => {
  it('reconoce solo los cuatro tonos', () => {
    expect(core.feedbackTones.every((tone) => core.isFeedbackTone(tone))).toBe(true);
    expect(core.isFeedbackTone('primary')).toBe(false);
  });
});

describe('contrato de Spinner', () => {
  it('comparte la escala de Icon', () => {
    expect(core.spinnerSizes).toBe(core.iconSizes);
    expect(core.spinnerSizePx).toBe(core.iconSizePx);
  });
});
