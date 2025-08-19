// eslint.config.js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Active Prettier comme règle ESLint
      'prettier/prettier': 'warn',

      // Quelques règles utiles pour React Native
      'react/react-in-jsx-scope': 'off', // inutile avec React 17+
      'react/jsx-uses-react': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]);
