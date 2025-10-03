import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import eslintPluginReact from 'eslint-plugin-react'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'
import type { Linter } from 'eslint'

const ignores = ['**/node_modules/**', '**/dist/**', '.*', 'scripts/**', '**/*.d.ts']

export default tseslint.config([
  {
    ignores,
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
    },
    rules: {
      'no-var': 'error',
      // todo
    },
  },
  // node
  // {
  //   ignores,
  //   files: [],
  //   languageOptions: {
  //     globals: {
  //       ...globals.browser,
  //     },
  //   },
  // },
  // vue
  {
    ignores,
    files: ['playgrounds/vite-vue/**/*.{ts,js,tsx,jsx,vue}'],
    extends: [...eslintPluginVue.configs['flat/recommended'], eslintConfigPrettier],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  // react
  {
    ignores,
    files: ['playgrounds/vite-react/**/*.{ts,js,tsx,jsx}'],
    extends: [eslintPluginReact.configs.flat, eslintConfigPrettier],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
]) as Linter.Config[]
