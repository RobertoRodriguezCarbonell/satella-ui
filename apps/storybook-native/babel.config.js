module.exports = (api) => {
  api.cache(true);
  // babel-preset-expo añade el plugin de react-native-worklets (reanimated 4) si está instalado.
  return { presets: ['babel-preset-expo'] };
};
