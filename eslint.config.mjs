import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['./node_modules/**', './src/shared/api/**', './dist/**']),

  // TypeScript
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
      jsdoc: eslintPluginJsdoc,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs.stylistic.rules,
      ...angularPlugin.configs['recommended'].rules,
      ...eslintPluginJsdoc.configs['flat/recommended'].rules,

      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'sr', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'sr', style: 'kebab-case' },
      ],
      // Kommentare
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: false,
            ArrowFunctionExpression: false,
          },
          contexts: [
            "PropertyDefinition > Decorator[expression.callee.name='Input']",
            "PropertyDefinition > Decorator[expression.callee.name='Output']",
            "MethodDefinition:not([accessibility='private']) > FunctionExpression",
          ],
        },
      ],
      // TypeScript
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
  // HTML
  {
    files: ['**/*.html'],
    languageOptions: { parser: angularTemplateParser },
    plugins: { '@angular-eslint/template': angularTemplatePlugin },
    rules: {
      ...angularTemplatePlugin.configs['recommended'].rules,
      ...angularTemplatePlugin.configs['accessibility'].rules,
    },
  },
]);
