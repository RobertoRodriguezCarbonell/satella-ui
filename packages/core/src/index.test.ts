import { describe, expect, it } from 'vitest';

import * as core from './index';

describe('API pública de core', () => {
  it('exporta exactamente estos nombres en runtime', () => {
    // Quitar o renombrar uno es un breaking change (ADR-025): este test obliga a hacerlo a propósito.
    expect(Object.keys(core).sort()).toEqual([
      'EMPTY_RANGE',
      'FormFieldContext',
      'OPTION_PAGE_SIZE',
      'TOAST_DEFAULT_DURATION',
      'TOAST_MAX_VISIBLE',
      'ToastContext',
      'UIContext',
      'addDays',
      'addMonths',
      'backgroundTokens',
      'badgeVariants',
      'borderColorTokens',
      'buttonIconSize',
      'buttonVariants',
      'calendarDirections',
      'calendarModes',
      'calendarSizes',
      'cardVariants',
      'clampDate',
      'clampPage',
      'controlSizes',
      'createCalendarFormatter',
      'createFormFieldValue',
      'createToastStore',
      'createUIContextValue',
      'dividerOrientations',
      'feedbackTones',
      'findOptionByText',
      'firstEnabledTab',
      'getColumnWidths',
      'getDateInDirection',
      'getDaysInMonth',
      'getMonthWeeks',
      'getNextRange',
      'getNextSort',
      'getOptionInDirection',
      'getPaginationItems',
      'getSelectionState',
      'getTabInDirection',
      'getWeekday',
      'getWeekdays',
      'iconButtonIconSize',
      'iconSizePx',
      'iconSizes',
      'inputIconSize',
      'inputTypes',
      'isDateInRange',
      'isFeedbackTone',
      'isISODate',
      'isISOMonth',
      'isRangeComplete',
      'linkUnderlines',
      'mergeTheme',
      'modalPresentations',
      'optionDirections',
      'paginationSizes',
      'parseISODate',
      'radiusTokens',
      'resolveColorScheme',
      'resolveFormFieldControl',
      'resolveTheme',
      'selectionStates',
      'shadowTokens',
      'shiftMonth',
      'skeletonShapes',
      'sortDirections',
      'spaceTokens',
      'spinnerSizePx',
      'spinnerSizes',
      'stackAligns',
      'stackDirections',
      'stackJustifies',
      'tabDirections',
      'tableAligns',
      'tableSizes',
      'textAligns',
      'textColors',
      'textVariantStyles',
      'textVariants',
      'themeModes',
      'toISODate',
      'toMonth',
      'todayISO',
      'toggleAllSelected',
      'toggleSelectedKey',
      'useBrand',
      'useButton',
      'useCalendar',
      'useColorScheme',
      'useControllableState',
      'useFormFieldControl',
      'useLink',
      'useTheme',
      'useToast',
      'useUIContext',
      'weekdays',
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
