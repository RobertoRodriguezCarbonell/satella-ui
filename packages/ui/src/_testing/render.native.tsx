import type { ThemeMode } from '@satellatickets/core';
import type { BrandName } from '@satellatickets/tokens';
import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import { UIProvider } from '../ui-provider';

interface Options {
  theme?: ThemeMode;
  brand?: BrandName;
}

/**
 * Renderiza dentro de `UIProvider`, como hace el decorador global de los Storybooks
 * (ADR-013). Los tests nativos lo usan con las historias compuestas (ADR-017).
 */
export function renderWithProvider(
  ui: ReactElement,
  { theme = 'dark', brand }: Options = {},
): ReturnType<typeof render> {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <UIProvider theme={theme} brand={brand}>
        {children}
      </UIProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}
