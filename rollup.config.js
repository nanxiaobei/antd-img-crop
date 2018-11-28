import sass from 'rollup-plugin-sass';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';

import pkg from './package.json';

const env = process.env.NODE_ENV;
const config = {
  input: 'src/index.jsx',
  output: { format: env, indent: false },
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
    'antd/es/modal/style/css',
    'antd/es/modal',
  ],
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['src/**/*.(js|jsx)'],
      exclude: ['node_modules/**'],
    }),
    sass({
      insert: true,
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
  ],
};

export default config;
