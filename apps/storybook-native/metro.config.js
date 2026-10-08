const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

// La configuración por defecto de Expo ya conoce el monorepo (watchFolders y
// node_modules de la raíz). Esta app ES el Storybook, así que siempre está activo.
const config = getDefaultConfig(__dirname);

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(__dirname, './.rnstorybook'),
  // STORYBOOK_WS=1 abre un canal WebSocket para controlar el dispositivo desde fuera
  // (seleccionar historias, cambiar globals): útil para verificación automatizada.
  ...(process.env.STORYBOOK_WS ? { websockets: 'auto' } : {}),
});
