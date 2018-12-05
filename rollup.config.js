import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import sass from 'rollup-plugin-sass';

import pkg from './package.json';

const { NODE_ENV } = process.env;
const dependencies = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)];

const config = {
  input: 'src/index.jsx',
  output: { format: NODE_ENV, indent: false },
  external: (id) => {
    if (dependencies.includes(id)) return true;
    if (id.includes('antd/') || id.includes('@babel/runtime/')) return true;
  },
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['src/**/*.(js|jsx)'],
      exclude: ['node_modules/**'],
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    sass({
      insert: true,
    }),
  ],
};

export default config;
