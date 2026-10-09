import { themes } from '@satellatickets/tokens';
import { composeStories } from '@storybook/react';
import { screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Pagination } from './Pagination';
import * as stories from './Pagination.stories';

// Las historias son la especificación compartida con web (ADR-017): se comprueban las
// mismas interacciones que sus funciones `play`.
const {
  Default,
  UltimaPagina,
  PocasPaginas,
  MuchasPaginas,
  Compacta,
  Deshabilitada,
  UnaPagina,
  ConTabla,
} = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`.
const onPageChange = stories.default.args.onPageChange;

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

const page = (number: number) => screen.getByRole('button', { name: `Página ${number}` });
const previous = () => screen.getByRole('button', { name: 'Página anterior' });
const next = () => screen.getByRole('button', { name: 'Página siguiente' });

/** Los números de página que se ven, en orden. */
function pages() {
  return screen.getAllByRole('button', { name: /^Página \d+$/ }).map((button) => {
    const label = button.props.accessibilityLabel as string;
    return Number(label.replace('Página ', ''));
  });
}

describe('Pagination (nativo)', () => {
  beforeEach(() => {
    onPageChange.mockClear();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('empieza en la primera página, que no tiene anterior', async () => {
      await renderWithProvider(<Default />);

      expect(page(1)).toBeSelected();
      expect(page(2)).not.toBeSelected();
      expect(previous()).toBeDisabled();
      expect(next()).toBeEnabled();
      // Las que no caben se resumen con un salto.
      expect(pages()).toEqual([1, 2, 3, 4, 5, 12]);
    });

    it('siguiente, anterior y los números avisan de la página a la que se va', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(next());
      expect(onPageChange).toHaveBeenLastCalledWith(2);
      expect(page(2)).toBeSelected();
      expect(page(1)).not.toBeSelected();

      await user.press(page(5));
      expect(onPageChange).toHaveBeenLastCalledWith(5);
      expect(page(5)).toBeSelected();
      expect(pages()).toEqual([1, 4, 5, 6, 12]);

      await user.press(previous());
      expect(onPageChange).toHaveBeenLastCalledWith(4);
    });

    it('en la última página no hay siguiente, y pulsar la actual no avisa', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<UltimaPagina />);

      expect(next()).toBeDisabled();
      expect(previous()).toBeEnabled();
      await user.press(page(12));

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('si caben todas las páginas, se muestran todas', async () => {
      await renderWithProvider(<PocasPaginas />);

      expect(pages()).toEqual([1, 2, 3, 4, 5]);
      expect(page(3)).toBeSelected();
    });

    it('siblingCount dice cuántas vecinas de la actual se ven', async () => {
      await renderWithProvider(<MuchasPaginas />);

      expect(pages()).toEqual([1, 22, 23, 24, 25, 26, 48]);
    });

    it('deshabilitada, ningún botón se puede pulsar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Deshabilitada />);

      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
      await user.press(page(7));

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('con una sola página no hay adónde ir', async () => {
      await renderWithProvider(<UnaPagina />);

      expect(previous()).toBeDisabled();
      expect(next()).toBeDisabled();
      expect(page(1)).toBeSelected();
    });

    it('controlada, espera a que la app le pase la página nueva', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default page={3} />);

      await user.press(next());

      expect(onPageChange).toHaveBeenLastCalledWith(4);
      expect(page(3)).toBeSelected();
    });

    it('con una tabla, la app recorta las filas de la página elegida', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<ConTabla />);
      expect(screen.getByText('Ana Ruiz')).toBeOnTheScreen();

      await user.press(next());
      expect(screen.queryByText('Ana Ruiz')).toBeNull();
      expect(screen.getByText('Iván Soto')).toBeOnTheScreen();

      // La última página trae menos filas.
      await user.press(page(3));
      expect(screen.getAllByLabelText(/^Asistente, /)).toHaveLength(2);
    });
  });

  describe('accesibilidad', () => {
    it('el grupo tiene nombre y no agrupa sus botones en un solo elemento', async () => {
      await renderWithProvider(<Default testID="paginas" />);

      const group = screen.getByTestId('paginas');
      expect(group.props.role).toBe('navigation');
      expect(group.props.accessibilityLabel).toBe('Páginas de pedidos');
      expect(group.props.accessible).not.toBe(true);
    });

    it('sin getPageLabel, el nombre de cada botón es su número', async () => {
      await renderWithProvider(
        <Pagination
          pageCount={3}
          accessibilityLabel="Páginas"
          previousLabel="Anterior"
          nextLabel="Siguiente"
        />,
      );

      expect(screen.getByRole('button', { name: '2' })).toBeOnTheScreen();
    });

    it('los saltos y las flechas son decorativos', async () => {
      await renderWithProvider(<MuchasPaginas />);

      expect(screen.queryByRole('image')).toBeNull();
      // Siete páginas, anterior y siguiente: los dos saltos no son botones.
      expect(screen.getAllByRole('button')).toHaveLength(9);
    });
  });

  describe('aspecto', () => {
    it('la página actual va teñida con el color de acento', async () => {
      await renderWithProvider(<Default />, { theme: 'dark' });

      expect(styleOf(page(1)).backgroundColor).toBe(themes.dark.color.accent.bg);
      expect(styleOf(screen.getByText('1'))).toMatchObject({
        color: themes.dark.color.accent.text,
        fontWeight: themes.dark.font.weight.semibold,
      });
      expect(styleOf(page(2)).backgroundColor).toBe('transparent');
      expect(styleOf(screen.getByText('2')).color).toBe(themes.dark.color.text.primary);
    });

    it.each([
      ['md', Default, themes.dark.size.control.md],
      ['sm', Compacta, themes.dark.size.control.sm],
    ] as const)(
      'en %s cada botón es un cuadrado del alto de un control',
      async (_size, Story, side) => {
        await renderWithProvider(<Story />);

        expect(styleOf(page(1))).toMatchObject({ minWidth: side, height: side });
        expect(styleOf(next())).toMatchObject({ width: side, height: side });
      },
    );

    it('deshabilitada, la página actual pierde el color de acento', async () => {
      await renderWithProvider(<Deshabilitada />, { theme: 'dark' });

      expect(styleOf(page(6)).backgroundColor).toBe(themes.dark.color.action.disabled);
      expect(styleOf(screen.getByText('6')).color).toBe(themes.dark.color.text.disabled);
    });
  });
});
