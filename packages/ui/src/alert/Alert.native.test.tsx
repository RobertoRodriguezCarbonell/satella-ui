import { feedbackTones } from '@satellatickets/core';
import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { screen, userEvent } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Alert } from './Alert';
import * as stories from './Alert.stories';

// Las historias son la especificación compartida con web (ADR-017).
const { Default, SoloTitulo, ConCierre } = composeStories(stories);

const TITLE = 'Las entradas se envían por correo';

describe('Alert (nativo)', () => {
  it('se anuncia como alerta con su título y su descripción', async () => {
    await renderWithProvider(<Default />);
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent(new RegExp(TITLE));
    expect(alert).toHaveTextContent(/Revisa también la carpeta de correo no deseado\./);
  });

  it.each([
    ['success', 'polite'],
    ['warning', 'assertive'],
    ['danger', 'assertive'],
    ['info', 'polite'],
  ] as const)('%s se anuncia en Android de forma %s', async (tone, live) => {
    await renderWithProvider(<Alert tone={tone} title="Aviso" />);

    expect(screen.getByRole('alert').props.accessibilityLiveRegion).toBe(live);
  });

  // En nativo no hay regresión visual (ADR-017): esto comprueba que cada tono lee sus tokens.
  it.each(feedbackTones)(
    'el tono %s usa el fondo, el borde, el texto y el icono de su color de feedback',
    async (tone) => {
      await renderWithProvider(<Alert tone={tone} title="Aviso" testID="alert" />, {
        theme: 'dark',
      });
      const colors = themes.dark.color.feedback[tone];
      const alert = screen.getByTestId('alert');

      expect(alert).toHaveStyle({ backgroundColor: colors.bg, borderColor: colors.border });
      expect(screen.getByText('Aviso')).toHaveStyle({ color: colors.text });
      const strokes = alert
        .queryAll((node) => typeof node.props.stroke === 'string')
        .map((node) => node.props.stroke as string);
      expect(new Set(strokes)).toEqual(new Set([colors.icon]));
    },
  );

  it('sin descripción muestra solo el título', async () => {
    await renderWithProvider(<SoloTitulo />);

    expect(screen.getByText('Cambios guardados')).toBeOnTheScreen();
  });

  it('envuelve en <Text> una descripción de texto y deja tal cual otro contenido', async () => {
    await renderWithProvider(
      <>
        <Alert title="Uno">Descripción de texto</Alert>
        <Alert title="Dos">
          <RNText testID="contenido-propio">Contenido propio</RNText>
        </Alert>
      </>,
    );

    expect(screen.getByText('Descripción de texto')).toBeOnTheScreen();
    expect(screen.getByTestId('contenido-propio')).toBeOnTheScreen();
  });

  it('sin onClose no hay botón de cierre', async () => {
    await renderWithProvider(<Default />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('con onClose muestra el botón con el nombre de closeLabel y lo llama al pulsarlo', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    await renderWithProvider(<ConCierre onClose={onClose} closeLabel="Cerrar aviso" />);

    await user.press(screen.getByRole('button', { name: 'Cerrar aviso' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el botón de cierre queda fuera del elemento que se anuncia como alerta', async () => {
    await renderWithProvider(<ConCierre />);

    expect(
      screen.getByRole('alert').queryAll((node) => node.props.accessibilityRole === 'button'),
    ).toHaveLength(0);
  });
});
