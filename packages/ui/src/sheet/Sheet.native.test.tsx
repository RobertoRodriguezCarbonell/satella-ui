import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import * as stories from './Sheet.stories';

// Las historias son la especificación compartida con web (ADR-017). `Sheet` es el mismo
// diálogo que `Modal` (ADR-040): aquí se comprueba lo que cambia, dónde se coloca.
const { Default, Abierto } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onClose = stories.default.args.onClose;

const TITLE = 'Filtrar eventos';

function styleOf(element: { props: { style?: unknown } }) {
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
    expect(screen.queryByRole('header', { name: TITLE })).toBeNull();
  });

  it('tocar fuera y el botón atrás de Android piden cerrar', async () => {
    const user = userEvent.setup();
    await renderWithProvider(<Abierto testID="filtros" />);

    await user.press(screen.getByTestId('filtros-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el botón atrás de Android pide cerrar', async () => {
    await renderWithProvider(<Abierto testID="filtros" />);

    await fireEvent(
      screen.getByTestId('filtros-modal', { includeHiddenElements: true }),
      'requestClose',
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se ancla al borde inferior, con las esquinas de arriba redondeadas y entra deslizándose', async () => {
    await renderWithProvider(<Abierto testID="filtros" />, { theme: 'dark' });
    const surface = screen.getByTestId('filtros');
    const overlay = surface.parent as unknown as { props: { style?: unknown } };

    expect(styleOf(overlay).justifyContent).toBe('flex-end');
    expect(styleOf(surface)).toMatchObject({
      borderTopLeftRadius: themes.dark.radius.xl,
      borderTopRightRadius: themes.dark.radius.xl,
    });
    expect(
      screen.getByTestId('filtros-modal', { includeHiddenElements: true }).props.animationType,
    ).toBe('slide');
  });
});
