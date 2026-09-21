import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // 强制使用 const 而非 let（当变量未被重新赋值时）
      'prefer-const': 'error',
      // 禁止使用 var
      'no-var': 'error',
      // 强制使用 === 而非 ==
      'eqeqeq': ['error', 'always'],
      // 禁止未使用的变量（下划线前缀除外）
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // 忽略兼容层文件（re-export 不需要 lint）
  {
    files: ['src/store/editStore.ts', 'src/request/**/*.ts', 'src/utils/storage.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
])
