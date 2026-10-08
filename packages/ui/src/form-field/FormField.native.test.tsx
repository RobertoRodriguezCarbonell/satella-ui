import { composeStories } from '@storybook/react';
import { screen } from '@testing-library/react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './FormField.stories';

// Las historias son la especificación compartida con web (ADR-017). En nativo no hay
// `htmlFor` ni `aria-describedby`: el control recibe la etiqueta como nombre accesible
// y la ayuda y el error como pista (ADR-037).
const { Default, ConAyuda, ConError, Obligatorio, Deshabilitado } = composeStories(stories);

const NAME = 'Correo electrónico';

describe('FormField (nativo)', () => {
  it('la etiqueta da nombre al control', async () => {
    await renderWithProvider(<Default />);

    expect(screen.getByLabelText(NAME)).toBeOnTheScreen();
    expect(screen.getByLabelText(NAME).props.placeholder).toBe('tu@correo.com');
  });

  it('la etiqueta visible no se lee dos veces: queda fuera del árbol de accesibilidad', async () => {
    await renderWithProvider(<Default />);

    expect(screen.queryByText(NAME)).toBeNull();
    expect(screen.getByText(NAME, { includeHiddenElements: true })).toBeTruthy();
  });

  it('la ayuda llega al control como pista', async () => {
    await renderWithProvider(<ConAyuda />);

    expect(screen.getByLabelText(NAME).props.accessibilityHint).toBe(
      'Te enviaremos las entradas a esta dirección.',
    );
  });

  it('el error va delante de la ayuda en la pista y se muestra con su icono', async () => {
    await renderWithProvider(<ConError />);

    expect(screen.getByLabelText(NAME).props.accessibilityHint).toBe(
      'Escribe un correo válido, como ana@correo.com. Te enviaremos las entradas a esta dirección.',
    );
    expect(screen.getByText('Escribe un correo válido, como ana@correo.com.')).toBeOnTheScreen();
  });

  it('el error se anuncia al aparecer', async () => {
    await renderWithProvider(<ConError />);

    const message = screen.getByText('Escribe un correo válido, como ana@correo.com.');
    expect(
      message.parent?.props.accessibilityLiveRegion ??
        message.parent?.parent?.props.accessibilityLiveRegion,
    ).toBe('polite');
  });

  it('required llega al control', async () => {
    await renderWithProvider(<Obligatorio />);

    expect(screen.getByLabelText(NAME).props['aria-required']).toBe(true);
  });

  it('disabled deshabilita el control que contiene', async () => {
    await renderWithProvider(<Deshabilitado />);

    expect(screen.getByLabelText(NAME)).toBeDisabled();
  });
});
