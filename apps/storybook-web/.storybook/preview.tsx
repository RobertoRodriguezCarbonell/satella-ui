import type { Preview } from '@storybook/react-vite';
import { themeModes, type ThemeMode } from '@satellatickets/core';
import { brandNames, type BrandName } from '@satellatickets/tokens';
import { Box, UIProvider } from '@satellatickets/ui';

const DEFAULT_BRAND = 'satella';

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (themeModes as readonly string[]).includes(value);
}

function isBrandName(value: unknown): value is BrandName {
  return typeof value === 'string' && (brandNames as readonly string[]).includes(value);
}

// Decorador global (ADR-013): cada historia se renderiza dentro de UIProvider con el
// tema y la marca elegidos en la toolbar, sobre el fondo de página del tema.
const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Fundamentos', ['UIProvider', 'Box', 'Stack', 'Text', 'Icon']] },
    },
  },
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'contrast',
        items: [
          { value: 'dark', title: 'Oscuro' },
          { value: 'light', title: 'Claro' },
          { value: 'system', title: 'Sistema' },
        ],
        dynamicTitle: true,
      },
    },
    brand: {
      description: 'Marca',
      toolbar: {
        title: 'Marca',
        icon: 'paintbrush',
        items: [
          { value: DEFAULT_BRAND, title: 'Satella' },
          ...brandNames.map((brand) => ({ value: brand, title: brand })),
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'dark', brand: DEFAULT_BRAND },
  decorators: [
    (Story, { globals }) => {
      const theme = isThemeMode(globals.theme) ? globals.theme : 'dark';
      const brand = isBrandName(globals.brand) ? globals.brand : undefined;
      return (
        <UIProvider theme={theme} brand={brand}>
          <Box background="canvas" padding={6} className="sb-canvas">
            <Story />
          </Box>
        </UIProvider>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
