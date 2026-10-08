/** Nombres derivados de la ruta de un token. */

function kebab(segment: string): string {
  return segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** `['color', 'action', 'primaryHover']` → `--color-action-primary-hover` */
export function cssVariableName(path: readonly string[]): string {
  return `--${path.map(kebab).join('-')}`;
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const INTEGER = /^(0|[1-9]\d*)$/;

/** Clave de objeto TypeScript: sin comillas si es identificador o entero. */
export function objectKey(key: string): string {
  return IDENTIFIER.test(key) || INTEGER.test(key) ? key : JSON.stringify(key);
}

export function isIdentifier(name: string): boolean {
  return IDENTIFIER.test(name);
}

/** Orden de las categorías raíz en las salidas; el resto va después, en orden de aparición. */
const CATEGORY_ORDER = [
  'color',
  'space',
  'size',
  'radius',
  'borderWidth',
  'font',
  'shadow',
  'duration',
  'zIndex',
];

export function categoryRank(path: readonly string[]): number {
  const index = CATEGORY_ORDER.indexOf(path[0] ?? '');
  return index === -1 ? CATEGORY_ORDER.length : index;
}
