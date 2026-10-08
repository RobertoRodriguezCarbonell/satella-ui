/**
 * Tests nativos (ADR-017): Jest con el preset jest-expo sobre las vistas `.native.tsx`.
 * Los tests viven junto a cada componente como `<Nombre>.native.test.tsx` y reutilizan
 * las historias, que son la especificación compartida con web.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.native.test.{ts,tsx}'],
  // Con pnpm cada paquete vive en node_modules/.pnpm/<paquete>/node_modules/<paquete>.
  // Se transforman con Babel React Native, Expo y Storybook (ESM); el resto se deja tal cual.
  transformIgnorePatterns: [
    '/node_modules/(?!(\\.pnpm|react-native|@react-native|@react-native-community|expo|@expo|react-native-svg|storybook|@storybook))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
