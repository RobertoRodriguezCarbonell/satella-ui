/** Las tres salidas de `dist/` se generan con la forma que definen ADR-006 y ADR-019. */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  buildTokens,
  renderAll,
  resolveSources,
  type GeneratedOutputs,
} from '../pipeline/index.ts';
import { loadResolved, loadSources, SRC_DIR } from './helpers.ts';

let outputs: GeneratedOutputs;

beforeAll(async () => {
  outputs = renderAll(await loadResolved());
});

describe('web/tokens.css', () => {
  it('declara el tema claro en :root y el oscuro solo con lo que cambia', () => {
    expect(outputs.css).toContain(':root,\n[data-theme="light"] {\n  color-scheme: light;');
    expect(outputs.css).toContain('[data-theme="dark"] {\n  color-scheme: dark;');
    expect(outputs.css).toContain('--color-bg-canvas: #f5f5fa;');
    expect(outputs.css).toContain('--color-bg-canvas: #0b0b12;');
    expect(outputs.css).toContain('--color-action-primary: #6c4cf5;');
    expect(outputs.css).toContain(
      '--font-family-display: Unbounded, "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;',
    );
    expect(outputs.css).toContain('--space-4: 1rem;');
    expect(outputs.css).toContain('--radius-full: 999px;');
    expect(outputs.css).toContain('--radius-md: 0.625rem;');
    // Las alturas de control escalan con el texto (rem); los grosores de borde, no (px).
    expect(outputs.css).toContain('--size-control-md: 2.75rem;');
    expect(outputs.css).toContain('--border-width-thin: 1px;');
    expect(outputs.css).toContain('--border-width-thick: 2px;');
    expect(outputs.css).toContain('--font-weight-semibold: 600;');
    expect(outputs.css).toContain('--shadow-sm: 0 1px 3px 0 #00000073;');
    expect(outputs.css).toContain('--shadow-glow: 0 0 28px 0 #6c4cf559;');
    expect(outputs.css).toContain('--duration-fast: 150ms;');
    expect(outputs.css).toContain('--z-index-modal: 1300;');
    expect(outputs.css).not.toContain('--palette-');
    const darkBlock = outputs.css.split('[data-theme="dark"] {')[1]?.split('}')[0] ?? '';
    expect(darkBlock).not.toContain('--space-');
    expect(darkBlock).toContain('--color-text-primary: #f5f5fa;');
  });

  it('emite un bloque por marca y otro combinado con el tema oscuro', () => {
    expect(outputs.css).toContain('[data-brand="demo"] {');
    expect(outputs.css).toContain('[data-theme="dark"][data-brand="demo"] {');
    const brandBlock = outputs.css.split('[data-brand="demo"] {')[1]?.split('}')[0] ?? '';
    expect(brandBlock).toContain('--color-action-primary: #0f766e;');
    expect(brandBlock).toContain('--radius-md: 0.75rem;');
    expect(brandBlock).not.toContain('--color-bg-canvas');
    // text.onAction ya es blanco en el tema claro: la marca no lo cambia ahí.
    expect(brandBlock).not.toContain('--color-text-on-primary');
    const darkBrandBlock =
      outputs.css.split('[data-theme="dark"][data-brand="demo"] {')[1]?.split('}')[0] ?? '';
    expect(darkBrandBlock).toContain('--color-action-primary: #5eead4;');
    expect(darkBrandBlock).toContain('--color-border-focus: #5eead4;');
    // En oscuro la base usa texto blanco sobre el primario (como Satella) y demo lo cambia a oscuro.
    expect(darkBrandBlock).toContain('--color-text-on-primary: #0b0b12;');
    expect(darkBrandBlock).not.toContain('--radius-md');
  });
});

describe('native/themes.ts', () => {
  it('exporta temas con valores numéricos y marcas con overrides por tema', () => {
    expect(outputs.native).toContain(
      "import type { BrandName, CssVariableName, Theme, ThemeName, ThemeOverrides, TokenName } from '../types';",
    );
    expect(outputs.native).toContain(
      'export const themeNames = [\n  "light",\n  "dark",\n] as const',
    );
    expect(outputs.native).toContain('export const light: Theme = {');
    expect(outputs.native).toContain('export const dark: Theme = {');
    expect(outputs.native).toContain('4: 16,');
    expect(outputs.native).toContain(
      'control: {\n      sm: 36,\n      md: 44,\n      lg: 52,\n    },',
    );
    expect(outputs.native).toContain('borderWidth: {\n    thin: 1,\n    thick: 2,\n  },');
    expect(outputs.native).toContain('sans: "Hanken Grotesk",');
    expect(outputs.native).toContain('display: "Unbounded",');
    expect(outputs.native).toContain('mono: "IBM Plex Mono",');
    expect(outputs.native).toContain('semibold: "600",');
    expect(outputs.native).toContain(
      '{ offsetX: 0, offsetY: 1, blurRadius: 3, spreadDistance: 0, color: "#00000073" }',
    );
    expect(outputs.native).toContain('fast: 150,');
    expect(outputs.native).toContain(
      'export const brands: Readonly<Record<BrandName, Readonly<Record<ThemeName, ThemeOverrides>>>> = {\n  admin: {',
    );
    expect(outputs.native).toContain('\n  demo: {\n');
    expect(outputs.native).toContain('\n  organizer: {\n');
    expect(outputs.native).toContain('"color.action.primary": "--color-action-primary",');
    expect(outputs.native).not.toContain('palette');
  });
});

describe('types.ts', () => {
  it('declara los nombres de temas, marcas y tokens, y la interfaz Theme', () => {
    expect(outputs.types).toContain('export type ThemeName =\n  | "light"\n  | "dark";');
    expect(outputs.types).toContain(
      'export type BrandName =\n  | "admin"\n  | "demo"\n  | "organizer";',
    );
    expect(outputs.types).toContain('| "color.action.primaryHover"');
    expect(outputs.types).toContain('| "--color-action-primary-hover"');
    expect(outputs.types).toContain('| "size.control.md"');
    expect(outputs.types).toContain('| "--border-width-thin"');
    expect(outputs.types).toContain('export interface Theme {');
    expect(outputs.types).toContain('/** Fondo de página. */\n      canvas: string;');
    expect(outputs.types).toContain('sans: string | undefined;');
    expect(outputs.types).toContain('semibold: FontWeight;');
    expect(outputs.types).toContain('sm: BoxShadow[];');
    expect(outputs.types).toContain('export type ThemeOverrides = DeepPartial<Theme>;');
  });

  it('con cero marcas BrandName es never', async () => {
    const sources = await loadSources();
    const { types } = renderAll(await resolveSources({ ...sources, brands: {} }));
    expect(types).toContain('export type BrandName = never;');
  });
});

describe('buildTokens', () => {
  let outDir: string;

  beforeAll(async () => {
    outDir = await mkdtemp(path.join(os.tmpdir(), 'satella-tokens-'));
  });

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it('escribe las tres salidas en dist', async () => {
    const summary = await buildTokens({ srcDir: SRC_DIR, outDir });
    expect(summary.themeNames).toEqual(['light', 'dark']);
    expect(summary.brandNames).toEqual(['admin', 'organizer']);
    expect(summary.tokenCount).toBeGreaterThan(90);
    expect(summary.files.map((file) => path.relative(outDir, file))).toEqual([
      'web/tokens.css',
      'native/themes.ts',
      'types.ts',
    ]);
    const types = await readFile(path.join(outDir, 'types.ts'), 'utf8');
    expect(types).toContain('export type BrandName =\n  | "admin"\n  | "organizer";');
  });
});

describe('marcas reales de Satella (solo tema oscuro)', () => {
  it('admin y organizer no cambian el tema claro y sí el oscuro', () => {
    expect(outputs.css).not.toMatch(/^\[data-brand="admin"\] \{/m);
    expect(outputs.css).not.toMatch(/^\[data-brand="organizer"\] \{/m);
    const admin =
      outputs.css.split('[data-theme="dark"][data-brand="admin"] {')[1]?.split('}')[0] ?? '';
    expect(admin).toContain('--color-action-primary: #7fee64;');
    expect(admin).toContain('--color-text-on-primary: #0a120a;');
    expect(admin).toContain('--color-bg-canvas: #181818;');
    expect(admin).toContain('--radius-md: 0.375rem;');
    expect(admin).toContain('--shadow-glow: 0 0 24px 0 #7fee6440;');
    const organizer =
      outputs.css.split('[data-theme="dark"][data-brand="organizer"] {')[1]?.split('}')[0] ?? '';
    expect(organizer).toContain('--color-action-primary: #f9791f;');
    expect(organizer).toContain('--color-bg-canvas: #0f0d09;');
    expect(organizer).not.toContain('--radius-md');
    expect(outputs.native).toContain('  admin: {\n    light: {},');
  });
});
