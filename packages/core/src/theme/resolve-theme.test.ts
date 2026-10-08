import { brands, themes } from '@satellatickets/tokens';
import { describe, expect, it } from 'vitest';

import { mergeTheme, resolveColorScheme, resolveTheme } from './resolve-theme';

describe('resolveTheme', () => {
  it('devuelve el tema base sin marca, con identidad estable', () => {
    expect(resolveTheme('dark')).toBe(themes.dark);
    expect(resolveTheme('light')).toBe(resolveTheme('light'));
  });

  it('aplica los overrides de la marca sobre el tema y conserva el resto', () => {
    const admin = resolveTheme('dark', 'admin');
    expect(admin.color.action.primary).toBe(brands.admin.dark.color?.action?.primary);
    expect(admin.color.action.primary).not.toBe(themes.dark.color.action.primary);
    expect(admin.radius.md).toBe(6);
    expect(admin.space).toEqual(themes.dark.space);
    expect(admin.shadow.sm).toEqual(themes.dark.shadow.sm);
  });

  it('en tema claro las marcas sin overrides caen al tema base', () => {
    expect(resolveTheme('light', 'organizer')).toEqual(themes.light);
  });

  it('mergeTheme sustituye arrays enteros y omite undefined', () => {
    const merged = mergeTheme(themes.light, {
      shadow: { sm: [] },
      font: { family: { sans: undefined } },
    });
    expect(merged.shadow.sm).toEqual([]);
    expect(merged.font.family.sans).toBe(themes.light.font.family.sans);
  });
});

describe('resolveColorScheme', () => {
  it('system sigue al sistema; light y dark son fijos', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });
});
