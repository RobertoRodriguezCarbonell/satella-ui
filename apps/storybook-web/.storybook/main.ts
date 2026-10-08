import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

// Las historias viven junto a cada componente en packages/ui (ADR-012). Este
// Storybook lee las compartidas y las .web.stories; las .native.stories son del nativo.
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    { directory: '../../../packages/ui/src', files: '**/*.mdx' },
    { directory: '../../../packages/ui/src', files: '**/!(*.native).stories.@(ts|tsx)' },
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
      // Tablas y demás sintaxis de GitHub en los README.mdx de los componentes.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-a11y',
    // Las historias son los tests web (ADR-016); la configuración está en vitest.config.ts.
    '@storybook/addon-vitest',
    // Fija :hover, :active y :focus-visible en una historia (ADR-030).
    'storybook-addon-pseudo-states',
  ],
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
