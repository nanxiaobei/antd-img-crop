import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import sass from 'rollup-plugin-sass';

import pkg from './package.json';

const env = process.env.NODE_ENV;
const dependencies = [
  ...Object.keys(pkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
];

const config = {
  input: 'src/index.jsx',
  output: { format: env, indent: false },
  external: (id) => {
    if (dependencies.includes(id)) return true;
    if (id.includes('@babel/runtime/') || id.includes('antd/')) return true;
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
      externalHelpers: true,
    }),
    sass({
      insert: true,
    }),
  ],
};

export default config;
