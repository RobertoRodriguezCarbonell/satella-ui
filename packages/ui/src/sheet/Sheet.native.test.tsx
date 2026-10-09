import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Dimensions, StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Sheet.stories';

// Las historias son la especificación compartida con web (ADR-017). `Sheet` es el mismo
// diálogo que `Modal` (ADR-040): aquí se comprueba lo que cambia, dónde se coloca.
const { Default, Abierto } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onClose = stories.default.args.onClose;

const TITLE = 'Filtrar eventos';

/** El fondo de un diálogo no es un control para los lectores de pantalla. */
const HIDDEN = { includeHiddenElements: true } as const;

interface StyledElement {
  props: { style?: unknown };
}

function styleOf(element: StyledElement) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

describe('Sheet (nativo)', () => {
  beforeEach(() => {
    onClose.mockClear();
  });

  it('cerrada no pinta nada y se abre cuando la app pone open a true', async () => {
    const user = userEvent.setup();
    await renderWithProvider(<Default />);
    expect(screen.queryByRole('header', { name: TITLE })).toBeNull();

    await user.press(screen.getByRole('button', { name: 'Filtros' }));

    expect(screen.getByRole('header', { name: TITLE })).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Conciertos' })).toBeChecked();
  });

  it('las acciones del pie piden cerrar con onClose', async () => {
    const user = userEvent.setup();
    await renderWithProvider(<Abierto />);

    await user.press(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    // Sigue en pantalla mientras dura su salida, y entonces desaparece.
    expect(screen.getByRole('header', { name: TITLE })).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByRole('header', { name: TITLE })).toBeNull());
  });

  it('tocar fuera pide cerrar, una sola vez aunque se toque otra durante la salida', async () => {
    const user = userEvent.setup();
    await renderWithProvider(<Abierto testID="filtros" />);
    const overlay = screen.getByTestId('filtros').parent as unknown as StyledElement;
    expect(styleOf(overlay).pointerEvents).toBe('auto');

    await user.press(screen.getByTestId('filtros-backdrop', HIDDEN));

    expect(onClose).toHaveBeenCalledTimes(1);
    // Mientras se va ya no se puede pulsar.
    expect(styleOf(overlay).pointerEvents).toBe('none');
    await waitFor(() => expect(screen.queryByTestId('filtros', HIDDEN)).toBeNull());
  });

  it('el botón atrás de Android pide cerrar', async () => {
    await renderWithProvider(<Abierto testID="filtros" />);

    await fireEvent(screen.getByTestId('filtros-modal', HIDDEN), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se ancla al borde inferior, con las esquinas de arriba redondeadas', async () => {
    await renderWithProvider(<Abierto testID="filtros" />, { theme: 'dark' });
    const surface = screen.getByTestId('filtros');
    const overlay = surface.parent as unknown as StyledElement;

    expect(styleOf(overlay).justifyContent).toBe('flex-end');
    expect(styleOf(surface)).toMatchObject({
      borderTopLeftRadius: themes.dark.radius.xl,
      borderTopRightRadius: themes.dark.radius.xl,
    });
  });

  it('el fondo se oscurece entero mientras la hoja sube desde el borde', async () => {
    await renderWithProvider(<Abierto testID="filtros" />, { theme: 'dark' });
    const surface = screen.getByTestId('filtros');
    const [dim] = (surface.parent as unknown as { children: StyledElement[] }).children;

    // La ventana no se desliza: arrastraría el fondo con ella y se vería subir su borde.
    expect(screen.getByTestId('filtros-modal', HIDDEN).props.animationType).toBe('none');
    // El oscurecido es una capa a pantalla completa que parte de transparente, y la hoja
    // parte de fuera de la pantalla. Los valores animados no pasan por React: aquí se ve
    // de dónde salen, no a dónde llegan.
    expect(styleOf(dim!)).toMatchObject({
      position: 'absolute',
      top: 0,
      bottom: 0,
      backgroundColor: themes.dark.color.bg.overlay,
      opacity: 0,
    });
    expect(styleOf(surface).transform).toEqual([{ translateY: Dimensions.get('window').height }]);
  });
});
