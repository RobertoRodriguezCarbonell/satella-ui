import type { Preview } from '@storybook/react-vite';
import { themeModes, type ThemeMode } from '@satellatickets/core';
import { brandNames, type BrandName } from '@satellatickets/tokens';
import { Box, UIProvider } from '@satellatickets/ui';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

import './fonts';
import './preview.css';

const DEFAULT_BRAND = 'satella';

/** Elemento que capturan las referencias visuales; vitest.setup.ts lo busca por este id. */
const STORY_ROOT_TEST_ID = 'sb-story';

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
    // `tests` es el lienzo en el que se ejecutan los tests (vitest.config.ts). Es más alto
    // que el del addon (1200 × 900) para que una matriz larga quepa entera en su
    // referencia visual: lo que queda fuera del lienzo sale en blanco en la captura.
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        tests: {
          name: 'Tests (1200 × 1800)',
          styles: { width: '1200px', height: '1800px' },
          type: 'desktop',
        },
      },
    },
    // Accesibilidad bloqueante (ADR-016): una violación hace fallar el test de la historia.
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Fundamentos',
          ['UIProvider', 'Box', 'Stack', 'Text', 'Icon'],
          'Acciones',
          ['Button', ['Patrón', '*', 'Estados web']],
          'Feedback',
        ],
      },
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
    (Story, { globals, viewMode }) => {
      const theme = isThemeMode(globals.theme) ? globals.theme : 'dark';
      const brand = isBrandName(globals.brand) ? globals.brand : undefined;
      return (
        <UIProvider theme={theme} brand={brand}>
          <Box background="canvas" className={viewMode === 'story' ? 'sb-canvas-fill' : undefined}>
            <Box padding={6} testID={STORY_ROOT_TEST_ID}>
              <Story />
            </Box>
          </Box>
        </UIProvider>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
