// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    indent: ['error', 2, { ignoredNodes: ['ImportDeclaration'] }],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['return', 'block-like', 'if']
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var', 'block-like', 'if'],
        next: '*'
      },
      {
        blankLine: 'any',
        prev: ['if'],
        next: ['if']
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var']
      }
    ],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-trailing-spaces': ['error'],
    'no-else-return': ['error'],
    'no-lonely-if': ['error'],
    'comma-spacing': 'error'
  }
}
