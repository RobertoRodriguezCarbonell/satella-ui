import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  createFormFieldValue,
  FormFieldContext,
  resolveFormFieldControl,
  useFormFieldControl,
} from './context';

describe('createFormFieldValue', () => {
  it('deriva los ids del id base y solo crea los de la ayuda y el error que existen', () => {
    expect(createFormFieldValue('f1', { label: 'Correo' })).toEqual({
      controlId: 'f1-control',
      helpId: undefined,
      errorId: undefined,
      label: 'Correo',
      help: undefined,
      error: undefined,
      disabled: false,
      required: false,
    });
    expect(
      createFormFieldValue('f1', {
        label: 'Correo',
        help: 'Ayuda',
        error: 'Error',
        required: true,
      }),
    ).toMatchObject({ helpId: 'f1-help', errorId: 'f1-error', required: true });
  });

  it('trata un texto vacío como ausente', () => {
    expect(createFormFieldValue('f1', { label: 'Correo', help: '', error: '' })).toMatchObject({
      helpId: undefined,
      errorId: undefined,
      help: undefined,
      error: undefined,
    });
  });
});

describe('resolveFormFieldControl', () => {
  it('fuera de un FormField devuelve las props propias del control', () => {
    expect(
      resolveFormFieldControl(null, { id: 'propio', invalid: true, accessibilityLabel: 'Buscar' }),
    ).toEqual({
      id: 'propio',
      describedBy: undefined,
      accessibilityLabel: 'Buscar',
      accessibilityHint: undefined,
      invalid: true,
      disabled: false,
      required: false,
    });
    expect(resolveFormFieldControl(null)).toMatchObject({ id: undefined, invalid: false });
  });

  it('dentro toma el id y la etiqueta del campo y enlaza la ayuda y el error', () => {
    const field = createFormFieldValue('f1', {
      label: 'Correo',
      help: 'Te enviaremos las entradas aquí.',
      error: 'Escribe un correo válido.',
    });
    expect(resolveFormFieldControl(field)).toEqual({
      id: 'f1-control',
      describedBy: 'f1-help f1-error',
      accessibilityLabel: 'Correo',
      accessibilityHint: 'Escribe un correo válido. Te enviaremos las entradas aquí.',
      invalid: true,
      disabled: false,
      required: false,
    });
  });

  it('sin ayuda ni error no describe nada', () => {
    const field = createFormFieldValue('f1', { label: 'Correo' });
    expect(resolveFormFieldControl(field)).toMatchObject({
      describedBy: undefined,
      accessibilityHint: undefined,
      invalid: false,
    });
  });

  it('el id y el nombre accesible del control mandan sobre los del campo', () => {
    const field = createFormFieldValue('f1', { label: 'Correo' });
    expect(
      resolveFormFieldControl(field, { id: 'propio', accessibilityLabel: 'Correo de contacto' }),
    ).toMatchObject({ id: 'propio', accessibilityLabel: 'Correo de contacto' });
  });

  it('invalid, disabled y required se suman: basta con que lo diga uno', () => {
    const plain = createFormFieldValue('f1', { label: 'Correo' });
    expect(
      resolveFormFieldControl(plain, { invalid: true, disabled: true, required: true }),
    ).toMatchObject({ invalid: true, disabled: true, required: true });

    const strict = createFormFieldValue('f1', { label: 'Correo', disabled: true, required: true });
    expect(resolveFormFieldControl(strict)).toMatchObject({ disabled: true, required: true });
  });
});

describe('useFormFieldControl', () => {
  it('lee el FormField que lo contiene', () => {
    const field = createFormFieldValue('f1', { label: 'Correo', error: 'Obligatorio' });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(FormFieldContext.Provider, { value: field }, children);

    const { result } = renderHook(() => useFormFieldControl(), { wrapper });

    expect(result.current).toMatchObject({ id: 'f1-control', invalid: true });
  });

  it('fuera de un FormField funciona con las props del control', () => {
    const { result } = renderHook(() => useFormFieldControl({ disabled: true }));

    expect(result.current).toMatchObject({ id: undefined, disabled: true });
  });
});
