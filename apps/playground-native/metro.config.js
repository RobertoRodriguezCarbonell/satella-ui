const { getDefaultConfig } = require('expo/metro-config');

// La configuración por defecto de Expo ya conoce el monorepo (watchFolders y
// node_modules de la raíz) y resuelve las vistas `.native.tsx` (ADR-004).
module.exports = getDefaultConfig(__dirname);
