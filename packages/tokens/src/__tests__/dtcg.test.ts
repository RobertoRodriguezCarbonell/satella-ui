/**
 * Los ficheros de tokens cumplen la especificación DTCG 2025.10 (ADR-015).
 * Se validan contra el JSON Schema oficial, incluido en `schemas/`, sin red.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { beforeAll, describe, expect, it } from 'vitest';

import { hexToRgba, parseColor } from '../pipeline/color.ts';
import type { DtcgColorValue } from '../pipeline/model.ts';
import { allTokenFiles, loadSources, PACKAGE_DIR, SCHEMA_PATH } from './helpers.ts';

const SCHEMA_URL = 'https://www.designtokens.org/schemas/2025.10/format.json';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isColorValue(value: Json): value is DtcgColorValue & { [key: string]: Json } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof value.colorSpace === 'string' &&
    Array.isArray(value.components)
  );
}

/** Recorre el documento y devuelve todos los valores de color literales con su ruta. */
function collectColors(
  node: Json,
  trail: string[] = [],
): { trail: string; value: DtcgColorValue }[] {
  if (typeof node !== 'object' || node === null) return [];
  if (Array.isArray(node))
    return node.flatMap((item, index) => collectColors(item, [...trail, String(index)]));
  if (isColorValue(node)) return [{ trail: trail.join('.'), value: node }];
  return Object.entries(node).flatMap(([key, value]) => collectColors(value, [...trail, key]));
}

let files: string[] = [];
let documents = new Map<string, Json>();

beforeAll(async () => {
  files = allTokenFiles(await loadSources());
  documents = new Map(
    await Promise.all(
      files.map(async (file) => [file, JSON.parse(await readFile(file, 'utf8')) as Json] as const),
    ),
  );
});

describe('ficheros DTCG 2025.10', () => {
  it('encuentra los siete ficheros de primitivos, dos temas y la marca de ejemplo', () => {
    const names = files.map((file) => path.relative(PACKAGE_DIR, file));
    expect(names.filter((name) => name.startsWith('src/primitives/'))).toHaveLength(7);
    expect(names).toContain('src/semantic/light.tokens.json');
    expect(names).toContain('src/semantic/dark.tokens.json');
    expect(names.some((name) => name.includes('fixtures/brands/demo/'))).toBe(true);
  });

  it('validan contra el JSON Schema oficial', async () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(JSON.parse(await readFile(SCHEMA_PATH, 'utf8')) as object);
    for (const [file, document] of documents) {
      const valid = validate(document);
      const errors = (validate.errors ?? [])
        .map((error) => `${error.instancePath || '/'} ${error.message ?? ''}`)
        .join('\n');
      expect(valid, `${path.relative(PACKAGE_DIR, file)}:\n${errors}`).toBe(true);
    }
  });

  it('declaran el $schema de la versión 2025.10', () => {
    for (const [file, document] of documents) {
      expect((document as { $schema?: Json }).$schema, file).toBe(SCHEMA_URL);
    }
  });

  it('los colores son sRGB y su hex de respaldo coincide con los componentes', () => {
    for (const [file, document] of documents) {
      for (const { trail, value } of collectColors(document)) {
        const label = `${path.relative(PACKAGE_DIR, file)} → ${trail}`;
        expect(value.colorSpace, label).toBe('srgb');
        expect(value.hex, label).toMatch(/^#[0-9a-f]{6}$/);
        const fromComponents = parseColor(value);
        const fromHex = hexToRgba(value.hex ?? '#000000');
        for (const channel of ['r', 'g', 'b'] as const) {
          expect(Math.abs(fromComponents[channel] - fromHex[channel]), label).toBeLessThan(1 / 255);
        }
      }
    }
  });
});
