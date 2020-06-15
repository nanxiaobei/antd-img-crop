import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import less from 'rollup-plugin-less';
import pkg from './package.json';

const input = 'src/index.jsx';
const external = (id) => !/index.less$/.test(id);
const plugins = (isEsm) => [
  !isEsm && replace({ '/es/': '/lib/' }),
  babel({
    presets: [
      ['@babel/preset-env', { targets: '> 0.25%, not dead', modules: false, loose: true }],
      ['@babel/preset-react', { useBuiltIns: true }],
    ],
    plugins: [['@babel/plugin-transform-runtime', { useESModules: isEsm }]],
    runtimeHelpers: true,
  }),
  less({ insert: true, output: false }),
];

export default [
  { input, output: { file: pkg.main, format: 'cjs' }, external, plugins: plugins(false) },
  { input, output: { file: pkg.module, format: 'es' }, external, plugins: plugins(true) },
];
