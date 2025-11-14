module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: ['react', 'react-hooks', 'react-native'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',

    // React Hooks rules (only critical ones)
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off', // Too noisy for now

    // React Native rules (very permissive)
    'react-native/no-unused-styles': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',

    // General rules (only critical issues)
    'no-console': 'off', // Allow console logs
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^React$',
        ignoreRestSiblings: true,
      },
    ],
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-dupe-keys': 'warn', // Changed to warning - doesn't break runtime
    'import/named': 'off', // Disable import validation
    'import/namespace': 'off', // Disable import validation
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.js', '**/*.spec.js', 'jest.setup.js'],
      env: {
        jest: true,
      },
      globals: {
        jest: true,
        expect: true,
        test: true,
        describe: true,
        it: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
  ],
};
