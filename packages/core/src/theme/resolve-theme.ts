import type { BrandName, Theme, ThemeName, ThemeOverrides } from '@satellatickets/tokens';
import { brands, themes } from '@satellatickets/tokens';

import type { ColorScheme, ThemeMode } from '../types/ui-provider';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function merge(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    const current = base[key];
    result[key] = isPlainObject(current) && isPlainObject(value) ? merge(current, value) : value;
  }
  return result;
}

/** Combina los overrides de una marca sobre un tema (ADR-010). Los arrays (sombras) se sustituyen enteros. */
export function mergeTheme(base: Theme, overrides: ThemeOverrides): Theme {
  return merge(base as unknown as Record<string, unknown>, overrides) as unknown as Theme;
}

const cache = new Map<string, Theme>();

/** Tema resuelto para un esquema y una marca; memoizado para que la identidad sea estable. */
export function resolveTheme(scheme: ThemeName, brand?: BrandName): Theme {
  const key = `${scheme}/${brand ?? ''}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const base = themes[scheme];
  const overrides = brand === undefined ? undefined : brands[brand]?.[scheme];
  const resolved = overrides === undefined ? base : mergeTheme(base, overrides);
  cache.set(key, resolved);
  return resolved;
}

export function resolveColorScheme(mode: ThemeMode, systemScheme: ColorScheme): ColorScheme {
  return mode === 'system' ? systemScheme : mode;
}
