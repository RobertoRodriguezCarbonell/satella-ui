import { themes } from '@satellatickets/tokens';
import { screen } from '@testing-library/react-native';

import { renderWithProvider } from '../_testing/render';
import { Divider } from './Divider';

function divider() {
  return screen.getByTestId('divider', { includeHiddenElements: true });
}

describe('Divider (nativo)', () => {
  it('es decorativo: los lectores de pantalla lo ignoran', async () => {
    await renderWithProvider(<Divider testID="divider" />);

    expect(screen.queryByTestId('divider')).toBeNull();
    expect(divider()).toBeTruthy();
  });

  it('horizontal es una línea del grosor y el color del borde que ocupa todo el ancho', async () => {
    await renderWithProvider(<Divider testID="divider" />, { theme: 'dark' });

    expect(divider()).toHaveStyle({
      alignSelf: 'stretch',
      height: 1,
      backgroundColor: themes.dark.color.border.default,
    });
  });

  it('vertical ocupa la altura de la fila que lo contiene', async () => {
    await renderWithProvider(<Divider orientation="vertical" testID="divider" />);

    expect(divider()).toHaveStyle({ alignSelf: 'stretch', width: 1 });
  });
});
