import { composeStories } from '@storybook/react';
import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { Linking, StyleSheet } from 'react-native';

import { renderWithProvider } from '../_testing/render';
import { Text } from '../text';
import { Link } from './Link';
import * as stories from './Link.stories';

// Las historias son la especificación compartida con web (ADR-017): se componen con sus
// args y decoradores, y aquí se comprueban las mismas interacciones que sus funciones `play`.
const { Default, EnTexto } = composeStories(stories);

// El mismo espía que comprueban las funciones `play` en web: el `fn()` de `meta.args`,
// que además cancela la navegación por defecto.
const onPress = stories.default.args.onPress;

const NAME = 'Ver todos los eventos';
const HREF = 'https://satellatickets.com/eventos';

function styleOf(element: { props: { style?: unknown } }) {
  return StyleSheet.flatten(element.props.style as never) as Record<string, unknown>;
}

describe('Link (nativo)', () => {
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    onPress.mockClear();
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    openURL.mockRestore();
  });

  describe('interacción (las mismas que las funciones play)', () => {
    it('llama a onPress una vez al pulsar', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('link', { name: NAME }));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('si onPress cancela, no abre el destino', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Default />);

      await user.press(screen.getByRole('link', { name: NAME }));

      expect(openURL).not.toHaveBeenCalled();
    });
  });

  describe('navegación por defecto', () => {
    it('sin onPress abre el destino con Linking', async () => {
      const user = userEvent.setup();
      await renderWithProvider(<Link href={HREF}>{NAME}</Link>);

      await user.press(screen.getByRole('link', { name: NAME }));

      expect(openURL).toHaveBeenCalledWith(HREF);
    });

    it('con un onPress que no cancela, abre el destino después de llamarlo', async () => {
      const user = userEvent.setup();
      const order: string[] = [];
      openURL.mockImplementation(() => {
        order.push('openURL');
        return Promise.resolve(true);
      });
      await renderWithProvider(
        <Link href={HREF} onPress={() => order.push('onPress')}>
          {NAME}
        </Link>,
      );

      await user.press(screen.getByRole('link', { name: NAME }));

      expect(order).toEqual(['onPress', 'openURL']);
    });

    it('si el sistema no puede abrir el destino, avisa en desarrollo y no lanza', async () => {
      const user = userEvent.setup();
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      openURL.mockRejectedValue(new Error('sin app para abrirlo'));
      await renderWithProvider(<Link href="/eventos">{NAME}</Link>);

      await user.press(screen.getByRole('link', { name: NAME }));

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('/eventos'), expect.any(Error));
      warn.mockRestore();
    });
  });

  describe('accesibilidad', () => {
    it('se anuncia como enlace con su texto como nombre', async () => {
      await renderWithProvider(<Default />);

      expect(screen.getByRole('link', { name: NAME })).toBeOnTheScreen();
    });

    it('accessibilityLabel sustituye al texto como nombre accesible', async () => {
      await renderWithProvider(<Default accessibilityLabel="Ver todos los eventos de Madrid" />);

      expect(
        screen.getByRole('link', { name: 'Ver todos los eventos de Madrid' }),
      ).toBeOnTheScreen();
    });
  });

  describe('tipografía', () => {
    it('fuera de un Text usa la tipografía de body', async () => {
      await renderWithProvider(<Default />);

      expect(styleOf(screen.getByRole('link', { name: NAME }))).toMatchObject({
        fontSize: 16,
        lineHeight: 24,
      });
    });

    it('dentro de un Text no fija tipografía: hereda la del texto que lo contiene', async () => {
      await renderWithProvider(<EnTexto />);

      const style = styleOf(screen.getByRole('link', { name: 'términos y condiciones' }));
      expect(style.fontSize).toBeUndefined();
      expect(style.lineHeight).toBeUndefined();
      expect(style.fontFamily).toBeUndefined();
    });

    it('con variant toma su tipografía, también dentro de un Text', async () => {
      await renderWithProvider(
        <Text>
          {'Texto '}
          <Link href={HREF} variant="caption">
            {NAME}
          </Link>
        </Text>,
      );

      expect(styleOf(screen.getByRole('link', { name: NAME }))).toMatchObject({ fontSize: 12 });
    });
  });

  describe('estados', () => {
    it('always subraya en reposo; hover solo mientras se pulsa', async () => {
      await renderWithProvider(
        <>
          <Link href={HREF}>Siempre</Link>
          <Link href={HREF} underline="hover">
            Al pulsar
          </Link>
        </>,
      );

      expect(styleOf(screen.getByRole('link', { name: 'Siempre' })).textDecorationLine).toBe(
        'underline',
      );
      expect(styleOf(screen.getByRole('link', { name: 'Al pulsar' })).textDecorationLine).toBe(
        'none',
      );

      await fireEvent(screen.getByRole('link', { name: 'Al pulsar' }), 'pressIn');
      expect(styleOf(screen.getByRole('link', { name: 'Al pulsar' })).textDecorationLine).toBe(
        'underline',
      );

      await fireEvent(screen.getByRole('link', { name: 'Al pulsar' }), 'pressOut');
      expect(styleOf(screen.getByRole('link', { name: 'Al pulsar' })).textDecorationLine).toBe(
        'none',
      );
    });

    it('mientras se pulsa toma el color del texto principal', async () => {
      await renderWithProvider(
        <>
          <Default />
          <Text testID="principal">Texto</Text>
        </>,
      );
      const primary = styleOf(screen.getByTestId('principal')).color;
      const rest = styleOf(screen.getByRole('link', { name: NAME })).color;
      expect(rest).not.toBe(primary);

      await fireEvent(screen.getByRole('link', { name: NAME }), 'pressIn');
      expect(styleOf(screen.getByRole('link', { name: NAME })).color).toBe(primary);

      await fireEvent(screen.getByRole('link', { name: NAME }), 'pressOut');
      expect(styleOf(screen.getByRole('link', { name: NAME })).color).toBe(rest);
    });
  });
});
