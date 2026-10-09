import { describe, expect, it } from 'vitest';

import { clampPage, getPaginationItems } from './items';

/** Los elementos en una línea: números y `…` para los saltos. */
function show(page: number, pageCount: number, siblingCount?: number): string {
  return getPaginationItems({ page, pageCount, siblingCount })
    .map((item) => (item.type === 'page' ? String(item.page) : '…'))
    .join(' ');
}

describe('getPaginationItems', () => {
  it('si caben todas, van todas', () => {
    expect(show(1, 1)).toBe('1');
    expect(show(3, 5)).toBe('1 2 3 4 5');
    expect(show(4, 7)).toBe('1 2 3 4 5 6 7');
  });

  it('sin páginas no hay elementos', () => {
    expect(show(1, 0)).toBe('');
  });

  it('resume con un salto al final cuando la actual está al principio', () => {
    expect(show(1, 12)).toBe('1 2 3 4 5 … 12');
    expect(show(4, 12)).toBe('1 2 3 4 5 … 12');
  });

  it('resume con dos saltos cuando la actual está en medio', () => {
    expect(show(5, 12)).toBe('1 … 4 5 6 … 12');
    expect(show(8, 12)).toBe('1 … 7 8 9 … 12');
  });

  it('resume con un salto al principio cuando la actual está al final', () => {
    expect(show(9, 12)).toBe('1 … 8 9 10 11 12');
    expect(show(12, 12)).toBe('1 … 8 9 10 11 12');
  });

  it('con saltos, el número de elementos no depende de la página actual', () => {
    for (const siblingCount of [0, 1, 2]) {
      for (let page = 1; page <= 30; page += 1) {
        expect(getPaginationItems({ page, pageCount: 30, siblingCount })).toHaveLength(
          siblingCount * 2 + 5,
        );
      }
    }
  });

  it('un salto nunca sustituye a una sola página', () => {
    for (let pageCount = 1; pageCount <= 20; pageCount += 1) {
      for (let page = 1; page <= pageCount; page += 1) {
        const items = getPaginationItems({ page, pageCount });
        items.forEach((item, index) => {
          if (item.type !== 'ellipsis') return;
          const before = items[index - 1];
          const after = items[index + 1];
          if (before?.type !== 'page' || after?.type !== 'page') throw new Error('salto suelto');
          expect(after.page - before.page).toBeGreaterThan(2);
        });
      }
    }
  });

  it('siempre incluye la primera, la última y la actual, en orden y sin repetir', () => {
    for (let pageCount = 1; pageCount <= 20; pageCount += 1) {
      for (let page = 1; page <= pageCount; page += 1) {
        const pages = getPaginationItems({ page, pageCount }).flatMap((item) =>
          item.type === 'page' ? [item.page] : [],
        );
        expect(pages).toContain(1);
        expect(pages).toContain(pageCount);
        expect(pages).toContain(page);
        expect(pages).toEqual([...new Set(pages)].sort((a, b) => a - b));
      }
    }
  });

  it('siblingCount amplía o reduce las vecinas de la actual', () => {
    expect(show(10, 20, 0)).toBe('1 … 10 … 20');
    expect(show(10, 20, 2)).toBe('1 … 8 9 10 11 12 … 20');
  });

  it('distingue el salto del principio del del final', () => {
    const items = getPaginationItems({ page: 6, pageCount: 12 });
    expect(items.filter((item) => item.type === 'ellipsis')).toEqual([
      { type: 'ellipsis', position: 'start' },
      { type: 'ellipsis', position: 'end' },
    ]);
  });

  it('una página fuera de rango se trata como el extremo más cercano', () => {
    expect(show(0, 12)).toBe(show(1, 12));
    expect(show(99, 12)).toBe(show(12, 12));
  });
});

describe('clampPage', () => {
  it('deja las páginas que existen', () => {
    expect(clampPage(3, 12)).toBe(3);
  });

  it('lleva al extremo más cercano', () => {
    expect(clampPage(0, 12)).toBe(1);
    expect(clampPage(-4, 12)).toBe(1);
    expect(clampPage(13, 12)).toBe(12);
  });

  it('sin páginas, o con un valor que no es un número, devuelve la 1', () => {
    expect(clampPage(5, 0)).toBe(1);
    expect(clampPage(Number.NaN, 12)).toBe(1);
  });

  it('ignora los decimales', () => {
    expect(clampPage(2.7, 12)).toBe(2);
  });
});
