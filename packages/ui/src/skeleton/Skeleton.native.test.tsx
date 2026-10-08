import { composeStories } from '@storybook/react';
import { act, screen } from '@testing-library/react-native';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Skeleton } from './Skeleton';
import * as stories from './Skeleton.stories';

// Las historias son la especificación compartida con web (ADR-017).
const { Default, Lineas } = composeStories(stories);

interface Node {
  props: { style?: unknown };
  children: unknown[];
}

function styleOf(element: { props: { style?: unknown } }) {
  return (StyleSheet.flatten(element.props.style as never) ?? {}) as Record<string, unknown>;
}

/** Las barras pintadas dentro del skeleton y la capa que late encima de cada una. */
function bars(testID = 'skeleton') {
  return screen.getByTestId(testID, { includeHiddenElements: true }).children as Node[];
}

describe('Skeleton (nativo)', () => {
  it('es decorativo: los lectores de pantalla lo ignoran', async () => {
    await renderWithProvider(<Default />);

    expect(screen.queryByTestId('skeleton')).toBeNull();
    expect(screen.getByTestId('skeleton', { includeHiddenElements: true })).toBeTruthy();
  });

  describe('text', () => {
    it('cada línea mide de alto lo que la letra y ocupa lo que su interlineado', async () => {
      await renderWithProvider(<Skeleton testID="skeleton" />);
      const [line] = bars();

      // `body`: letra de 16 pt en una línea de 24 pt.
      expect(styleOf(line as Node)).toMatchObject({ height: 16, marginVertical: 4, width: '100%' });
    });

    it('toma la medida de la variante de texto', async () => {
      await renderWithProvider(<Skeleton testID="skeleton" variant="caption" />);

      // `caption`: letra de 12 pt en una línea de 16 pt.
      expect(styleOf(bars()[0] as Node)).toMatchObject({ height: 12, marginVertical: 2 });
    });

    it('con varias líneas, la última es más corta', async () => {
      await renderWithProvider(<Lineas testID="skeleton" />);
      const lines = bars();

      expect(lines).toHaveLength(3);
      expect(styleOf(lines[0] as Node).width).toBe('100%');
      expect(styleOf(lines[2] as Node).width).toBe('60%');
    });
  });

  describe('rectangle y circle', () => {
    it('rectangle ocupa todo el ancho y mide de alto lo que un control por defecto', async () => {
      await renderWithProvider(<Skeleton testID="skeleton" shape="rectangle" />);

      expect(styleOf(bars()[0] as Node)).toMatchObject({ width: '100%', height: 44 });
    });

    it('admite width en puntos o en porcentaje y height en puntos', async () => {
      await renderWithProvider(
        <Skeleton testID="skeleton" shape="rectangle" width="50%" height={32} />,
      );

      expect(styleOf(bars()[0] as Node)).toMatchObject({ width: '50%', height: 32 });
    });

    it('circle mide lo mismo de ancho que de alto y es redondo', async () => {
      await renderWithProvider(<Skeleton testID="skeleton" shape="circle" height={64} />);
      const style = styleOf(bars()[0] as Node);

      expect(style).toMatchObject({ width: 64, height: 64 });
      expect(style.borderRadius).toBeGreaterThanOrEqual(64);
    });
  });

  describe('movimiento', () => {
    it('con movimiento reducido se queda quieto, con el color de reposo', async () => {
      const reduced = jest
        .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
        .mockResolvedValue(true);
      await renderWithProvider(<Skeleton testID="skeleton" shape="rectangle" />);
      // Deja resolver la consulta a los ajustes del sistema.
      await act(async () => {
        await Promise.resolve();
      });

      const [layer] = (bars()[0] as Node).children as Node[];
      expect(styleOf(layer as Node).opacity).toBe(1);
      reduced.mockRestore();
    });
  });
});
