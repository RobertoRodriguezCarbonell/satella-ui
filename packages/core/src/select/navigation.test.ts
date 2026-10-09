import { describe, expect, it } from 'vitest';

import {
  findOptionByText,
  getOptionInDirection,
  OPTION_PAGE_SIZE,
  optionDirections,
} from './navigation';

const CITIES = [
  { value: 'mad', label: 'Madrid' },
  { value: 'bcn', label: 'Barcelona' },
  { value: 'vlc', label: 'Valencia' },
  { value: 'svq', label: 'Sevilla', disabled: true },
  { value: 'bio', label: 'Bilbao' },
] as const;

const MANY = Array.from({ length: 25 }, (_, index) => ({
  value: `v${index}`,
  label: `Opción ${index}`,
}));

describe('getOptionInDirection', () => {
  it('next y previous saltan las deshabilitadas', () => {
    expect(getOptionInDirection(CITIES, 'vlc', 'next')).toBe('bio');
    expect(getOptionInDirection(CITIES, 'bio', 'previous')).toBe('vlc');
  });

  it('no da la vuelta: en un extremo se queda en él', () => {
    expect(getOptionInDirection(CITIES, 'bio', 'next')).toBe('bio');
    expect(getOptionInDirection(CITIES, 'mad', 'previous')).toBe('mad');
  });

  it('first y last van a los extremos habilitados', () => {
    expect(getOptionInDirection(CITIES, 'vlc', 'first')).toBe('mad');
    expect(getOptionInDirection(CITIES, 'mad', 'last')).toBe('bio');
    expect(
      getOptionInDirection(
        [
          { value: 'x', label: 'X', disabled: true },
          { value: 'y', label: 'Y' },
        ],
        undefined,
        'first',
      ),
    ).toBe('y');
  });

  it('nextPage y previousPage saltan una página sin pasarse de los extremos', () => {
    expect(getOptionInDirection(MANY, 'v2', 'nextPage')).toBe(`v${2 + OPTION_PAGE_SIZE}`);
    expect(getOptionInDirection(MANY, 'v20', 'nextPage')).toBe('v24');
    expect(getOptionInDirection(MANY, 'v12', 'previousPage')).toBe(`v${12 - OPTION_PAGE_SIZE}`);
    expect(getOptionInDirection(MANY, 'v3', 'previousPage')).toBe('v0');
  });

  it('sin opción actual, o si está deshabilitada, entra por el extremo que toca', () => {
    expect(getOptionInDirection(CITIES, undefined, 'next')).toBe('mad');
    expect(getOptionInDirection(CITIES, undefined, 'nextPage')).toBe('mad');
    expect(getOptionInDirection(CITIES, undefined, 'previous')).toBe('bio');
    expect(getOptionInDirection(CITIES, 'svq', 'next')).toBe('mad');
    expect(getOptionInDirection(CITIES, 'no-existe', 'previousPage')).toBe('bio');
  });

  it('sin opciones habilitadas devuelve la actual', () => {
    for (const direction of optionDirections) {
      expect(getOptionInDirection([], undefined, direction)).toBeUndefined();
      expect(
        getOptionInDirection([{ value: 'a', label: 'A', disabled: true }], 'a', direction),
      ).toBe('a');
    }
  });
});

describe('findOptionByText', () => {
  it('encuentra la primera opción que empieza por el texto', () => {
    expect(findOptionByText(CITIES, 'v')).toBe('vlc');
    expect(findOptionByText(CITIES, 'bi')).toBe('bio');
  });

  it('no distingue mayúsculas ni acentos', () => {
    const provinces = [
      { value: 'al', label: 'Álava' },
      { value: 'av', label: 'Ávila' },
      { value: 'co', label: 'A Coruña' },
    ];
    expect(findOptionByText(provinces, 'AV')).toBe('av');
    expect(findOptionByText(provinces, 'á')).toBe('al');
    expect(findOptionByText(provinces, 'a c')).toBe('co');
  });

  it('una letra busca a partir de la siguiente a la actual y da la vuelta', () => {
    expect(findOptionByText(CITIES, 'b')).toBe('bcn');
    expect(findOptionByText(CITIES, 'b', 'bcn')).toBe('bio');
    expect(findOptionByText(CITIES, 'b', 'bio')).toBe('bcn');
    expect(findOptionByText(CITIES, 'm', 'mad')).toBe('mad');
  });

  it('un texto más largo se queda en la actual mientras coincida', () => {
    const options = [
      { value: 'bar', label: 'Barcelona' },
      { value: 'bad', label: 'Badajoz' },
      { value: 'bil', label: 'Bilbao' },
    ];
    expect(findOptionByText(options, 'ba', 'bar')).toBe('bar');
    expect(findOptionByText(options, 'bad', 'bar')).toBe('bad');
    expect(findOptionByText(options, 'bi', 'bar')).toBe('bil');
  });

  it('la misma letra repetida vale como pulsarla otra vez', () => {
    expect(findOptionByText(CITIES, 'bb', 'bcn')).toBe('bio');
    expect(findOptionByText(CITIES, 'bbb', 'bio')).toBe('bcn');
    // Salvo que sea el principio de una opción.
    const options = [
      { value: 'aar', label: 'Aarón' },
      { value: 'ana', label: 'Ana' },
    ];
    expect(findOptionByText(options, 'aa', 'ana')).toBe('aar');
  });

  it('nunca devuelve una opción deshabilitada', () => {
    expect(findOptionByText(CITIES, 's')).toBeUndefined();
    expect(findOptionByText(CITIES, 'sevilla')).toBeUndefined();
  });

  it('sin coincidencia o sin texto devuelve undefined', () => {
    expect(findOptionByText(CITIES, 'z')).toBeUndefined();
    expect(findOptionByText(CITIES, 'bx', 'bcn')).toBeUndefined();
    expect(findOptionByText(CITIES, '')).toBeUndefined();
    expect(findOptionByText([], 'a')).toBeUndefined();
  });
});
