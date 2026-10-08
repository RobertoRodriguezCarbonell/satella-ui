/** src/icons.ts está sincronizado con svg/ y todos los iconos son dibujables. */
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { iconNames, icons } from './icons';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('iconos', () => {
  it('tiene al menos los iconos que usan los componentes base', () => {
    expect(iconNames).toEqual(
      expect.arrayContaining(['check', 'x', 'chevron-down', 'loader-circle', 'search']),
    );
    for (const name of iconNames) expect(icons[name].length).toBeGreaterThan(0);
  });

  it('src/icons.ts coincide con lo que genera scripts/generate.ts', async () => {
    const before = await readFile(path.join(root, 'src/icons.ts'), 'utf8');
    await promisify(execFile)(
      'node',
      ['--disable-warning=ExperimentalWarning', 'scripts/generate.ts'],
      { cwd: root },
    );
    const after = await readFile(path.join(root, 'src/icons.ts'), 'utf8');
    expect(after).toBe(before);
  });
});
