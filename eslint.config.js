// import eslint from '@eslint/js'
// import tseslint from 'typescript-eslint'
// import eslintPluginPrettier from 'eslint-plugin-prettier'
// import eslintPluginVue from 'eslint-plugin-vue'
// import eslintPluginReact from 'eslint-plugin-react'
// import globals from 'globals'
// import eslintConfigPrettier from 'eslint-config-prettier'

const ignores = [
  '**/node_modules/**',
  '**/dist/**',
  '.*',
  'scripts/**',
  '**/*.d.ts',
  '**/public/lib/**',
  '**/public/webgal*',
]

// export default [
//   {
//     ignores,
//     ...eslint.configs.recommended,
//     ...tseslint.configs.recommended,
//     ...eslintConfigPrettier,
//     plugins: {
//       prettier: eslintPluginPrettier,
//     },
//     languageOptions: {
//       ecmaVersion: 'latest',
//       sourceType: 'module',
//       parser: tseslint.parser,
//     },
//     rules: {
//       'no-var': 'error',
//       // todo
//     },
//   },
//   // node
//   // {
//   //   ignores,
//   //   files: [],
//   //   languageOptions: {
//   //     globals: {
//   //       ...globals.browser,
//   //     },
//   //   },
//   // },
//   // vue
//   {
//     ignores,
//     ...eslintPluginVue.configs['flat/recommended'],
//     ...eslintConfigPrettier,
//     files: ['playgrounds/vite-vue/**/*.{ts,js,tsx,jsx,vue}'],
//     languageOptions: {
//       globals: {
//         ...globals.browser,
//       },
//     },
//   },
//   // react
//   {
//     ignores,
//     ...eslintPluginReact.configs.flat,
//     ...eslintConfigPrettier,
//     files: ['playgrounds/vite-react/**/*.{ts,js,tsx,jsx}'],
//     languageOptions: {
//       globals: {
//         ...globals.browser,
//       },
//     },
//   },
// ]
export default [
  {
    ignores, // 忽略目录
  },
  {
    rules: {
      'no-console': 'error', // 禁止使用 console
      'no-var': 'error',
    },
  },
]
