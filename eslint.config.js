// @ts-check
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['node_modules/', 'dist/', 'coverage/', 'data/']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // This config file itself is not in tsconfig's include list.
          allowDefaultProject: ['eslint.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Subprocess orchestration is the backbone of this project (ADR 0002),
      // so an unawaited promise is a real defect, not a style preference.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // Computed results are compared with tolerances; === on floats is
      // almost always a mistake here. See NFR-08.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "BinaryExpression[operator=/^[=!]==$/] > .left[typeAnnotation.typeAnnotation.type='TSNumberKeyword']",
          message:
            'Compare numbers with a tolerance, not with strict equality. See NFR-08.',
        },
      ],
    },
  },
  prettier,
]);
