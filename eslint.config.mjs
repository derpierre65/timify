import baseConfig from '@derpierre65/eslint-config/base';
import vue3Config from '@derpierre65/eslint-config/vue3';
import tsConfig from '@derpierre65/eslint-config/ts';

export default [
  ...baseConfig,
  ...tsConfig,
  ...vue3Config,
];
