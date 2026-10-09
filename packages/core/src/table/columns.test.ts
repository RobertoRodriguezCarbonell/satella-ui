import { describe, expect, it } from 'vitest';

import { getColumnWidths } from './columns';

const options = { available: 0, defaultMinWidth: 96 };

describe('getColumnWidths', () => {
  it('sin espacio conocido, cada columna mide su ancho fijo o su mínimo', () => {
    expect(getColumnWidths([{}, { minWidth: 160 }, { width: 72 }], options)).toEqual([96, 160, 72]);
  });

  it('reparte a partes iguales lo que sobra entre las columnas sin ancho fijo', () => {
    // 96 + 160 + 72 = 328; sobran 100 para dos columnas.
    expect(
      getColumnWidths([{}, { minWidth: 160 }, { width: 72 }], { ...options, available: 428 }),
    ).toEqual([146, 210, 72]);
  });

  it('las columnas ocupan justo el espacio disponible', () => {
    const widths = getColumnWidths([{}, {}, { minWidth: 200 }], { ...options, available: 1000 });
    expect(widths.reduce((total, width) => total + width, 0)).toBeCloseTo(1000);
  });

  it('si no caben, ninguna baja de su mínimo', () => {
    expect(getColumnWidths([{}, {}, {}, {}], { ...options, available: 300 })).toEqual([
      96, 96, 96, 96,
    ]);
  });

  it('width manda sobre minWidth', () => {
    expect(getColumnWidths([{ width: 80, minWidth: 200 }], { ...options, available: 500 })).toEqual(
      [80],
    );
  });

  it('si todas tienen ancho fijo, lo que sobra queda libre', () => {
    expect(
      getColumnWidths([{ width: 80 }, { width: 120 }], { ...options, available: 500 }),
    ).toEqual([80, 120]);
  });

  it('sin columnas no hay anchos', () => {
    expect(getColumnWidths([], { ...options, available: 500 })).toEqual([]);
  });
});
