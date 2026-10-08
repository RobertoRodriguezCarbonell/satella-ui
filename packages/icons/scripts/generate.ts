/**
 * Genera src/icons.ts a partir de los SVG de svg/ (lucide, 24×24, trazo de 2 px).
 * Cada icono se guarda como lista de primitivas (path, circle, line, rect) que las
 * vistas web y nativa de `Icon` dibujan con SVG y react-native-svg.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgDir = path.join(root, 'svg');
const outFile = path.join(root, 'src', 'icons.ts');

type Element =
  | { type: 'path'; d: string }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number };

function attrs(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([a-zA-Z0-9:-]+)="([^"]*)"/g)) {
    result[match[1] ?? ''] = match[2] ?? '';
  }
  return result;
}

function num(value: string | undefined, name: string, file: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    throw new Error(`${file}: atributo ${name} inválido ("${value ?? ''}")`);
  return parsed;
}

function parse(svg: string, file: string): Element[] {
  const elements: Element[] = [];
  for (const match of svg.matchAll(
    /<(path|circle|line|rect|polyline|polygon|ellipse)\b([^>]*?)\/?>/g,
  )) {
    const tag = match[1] ?? '';
    const a = attrs(match[2] ?? '');
    switch (tag) {
      case 'path':
        elements.push({ type: 'path', d: a.d ?? '' });
        break;
      case 'circle':
        elements.push({
          type: 'circle',
          cx: num(a.cx, 'cx', file),
          cy: num(a.cy, 'cy', file),
          r: num(a.r, 'r', file),
        });
        break;
      case 'line':
        elements.push({
          type: 'line',
          x1: num(a.x1, 'x1', file),
          y1: num(a.y1, 'y1', file),
          x2: num(a.x2, 'x2', file),
          y2: num(a.y2, 'y2', file),
        });
        break;
      case 'rect':
        elements.push({
          type: 'rect',
          x: num(a.x, 'x', file),
          y: num(a.y, 'y', file),
          width: num(a.width, 'width', file),
          height: num(a.height, 'height', file),
          ...(a.rx !== undefined ? { rx: num(a.rx, 'rx', file) } : {}),
        });
        break;
      default:
        throw new Error(`${file}: elemento <${tag ?? ''}> no soportado; conviértelo a path.`);
    }
  }
  if (elements.length === 0) throw new Error(`${file}: sin elementos de dibujo.`);
  return elements;
}

const files = (await readdir(svgDir)).filter((name) => name.endsWith('.svg')).sort();
const entries: string[] = [];
for (const file of files) {
  const name = path.basename(file, '.svg');
  const elements = parse(await readFile(path.join(svgDir, file), 'utf8'), file);
  const rendered = elements.map((element) => `    ${JSON.stringify(element)},`).join('\n');
  entries.push(`  ${JSON.stringify(name)}: [\n${rendered}\n  ],`);
}

const output = `/**
 * Generado por scripts/generate.ts a partir de svg/*.svg. No editar a mano.
 * Iconos de Lucide (https://lucide.dev), licencia ISC; ver NOTICE.md.
 */

export type IconElement =
  | { readonly type: 'path'; readonly d: string }
  | { readonly type: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly type: 'line'; readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }
  | {
      readonly type: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx?: number;
    };

/** Caja de dibujo de todos los iconos (lucide): 24×24, trazo de 2 px, sin relleno. */
export const ICON_VIEWBOX = 24;
export const ICON_STROKE_WIDTH = 2;

export const iconNames = [
${files.map((file) => `  ${JSON.stringify(path.basename(file, '.svg'))},`).join('\n')}
] as const;

export type IconName = (typeof iconNames)[number];

export const icons: Readonly<Record<IconName, readonly IconElement[]>> = {
${entries.join('\n')}
};
`;
await writeFile(outFile, output, 'utf8');
console.log(`[icons] ${files.length} iconos → ${path.relative(root, outFile)}`);
