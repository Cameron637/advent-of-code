// @ts-check

import cdpEslintConfig from '@chghealthcare/cdp-eslint-config';
import tseslint from 'typescript-eslint';

export default [
  ...cdpEslintConfig,
  ...tseslint.configs.recommended,
  { ignores: ['dist/*'] },
  { rules: { 'no-console': 'off' } },
];
