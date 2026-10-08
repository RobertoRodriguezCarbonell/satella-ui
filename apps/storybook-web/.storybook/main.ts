import type { StorybookConfig } from '@storybook/react-vite';

// Las historias viven junto a cada componente en packages/ui (ADR-012). Este
// Storybook lee las compartidas y las .web.stories; las .native.stories son del nativo.
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    { directory: '../../../packages/ui/src', files: '**/*.mdx' },
    { directory: '../../../packages/ui/src', files: '**/!(*.native).stories.@(ts|tsx)' },
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      // Vite resuelve `./Button` a `Button.web.tsx` antes que a `Button.tsx` (ADR-004).
      extensions: ['.web.tsx', '.web.ts', '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
  }),
};

export default config;
