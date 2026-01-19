// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // 기본 포맷팅 규칙
      'indent': ['warn', 2], // 2칸 들여쓰기
      'quotes': ['warn', 'single'], // 작은따옴표
      'semi': ['warn', 'always'], // 세미콜론 필수
      'comma-dangle': ['error', 'always-multiline'], // 여러 줄 마지막 쉼표
      'object-curly-spacing': ['error', 'always'], // { foo } 공백
      'array-bracket-spacing': ['error', 'never'], // [1, 2] 공백 없음
      'arrow-spacing': ['error', { before: true, after: true }], // () => {} 공백
      'comma-spacing': ['error', { before: false, after: true }], // a, b 쉼표 뒤 공백
      'key-spacing': ['error', { afterColon: true }], // key: value 콜론 뒤 공백
      'keyword-spacing': ['error'], // if () 키워드 공백
    },
  },
];
