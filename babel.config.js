module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // 👈 doit être le DERNIER plugin
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
