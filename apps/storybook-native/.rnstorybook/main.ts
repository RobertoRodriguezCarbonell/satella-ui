import type { StorybookConfig } from '@storybook/react-native';

// Las historias viven junto a cada componente en packages/ui (ADR-012). Este
// Storybook lee las compartidas y las .native.stories; las .web.stories son del web.
const main: StorybookConfig = {
  stories: ['../../../packages/ui/src/**/!(*.web).stories.@(ts|tsx)'],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
  features: {
    // Panel de fondos basado en globals: hace de selector de tema y marca (ver preview.tsx).
    ondeviceBackgrounds: true,
  },
};

export default main;
