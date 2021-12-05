// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,

  env: {
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021
  },

  rules: {
    'semi':['error','never'],
    'jest/no-commented-out-tests':'off'
  },

  overrides: [
    {
      files: [
        '**/tests/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
})
