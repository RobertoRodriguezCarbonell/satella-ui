import type { Preview } from '@storybook/react-native';
import { resolveTheme, type ThemeMode } from '@satellatickets/core';
import type { BrandName } from '@satellatickets/tokens';
import { Box, UIProvider } from '@satellatickets/ui';

interface Context {
  name: string;
  theme: ThemeMode;
  brand: BrandName | undefined;
}

// Cada opción del panel "Backgrounds" es una combinación tema + marca (ADR-013): el
// panel pinta el fondo de página de esa combinación y el decorador aplica UIProvider.
const contexts: Record<string, Context> = {
  dark: { name: 'Oscuro', theme: 'dark', brand: undefined },
  light: { name: 'Claro', theme: 'light', brand: undefined },
  admin: { name: 'Admin (oscuro)', theme: 'dark', brand: 'admin' },
  organizer: { name: 'Organizer (oscuro)', theme: 'dark', brand: 'organizer' },
};

const DEFAULT_CONTEXT = 'dark';

function canvasOf({ theme, brand }: Context): string {
  return resolveTheme(theme === 'system' ? 'dark' : theme, brand).color.bg.canvas;
}

function contextFromGlobals(globals: Record<string, unknown>): Context {
  const backgrounds = globals.backgrounds;
  const key =
    typeof backgrounds === 'object' && backgrounds !== null && 'value' in backgrounds
      ? String((backgrounds as { value?: unknown }).value)
      : DEFAULT_CONTEXT;
  return contexts[key] ?? contexts[DEFAULT_CONTEXT]!;
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: Object.fromEntries(
        Object.entries(contexts).map(([key, context]) => [
          key,
          { name: context.name, value: canvasOf(context) },
        ]),
      ),
    },
  },
  initialGlobals: {
    backgrounds: { value: DEFAULT_CONTEXT },
  },
  decorators: [
    (Story, { globals }) => {
      const context = contextFromGlobals(globals);
      return (
        <UIProvider theme={context.theme} brand={context.brand}>
          <Box padding={4} flex={1}>
            <Story />
          </Box>
        </UIProvider>
      );
    },
  ],
};

export default preview;
