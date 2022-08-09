import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import less from 'rollup-plugin-less';
import pkg from './package.json';

const input = 'src/img-crop.tsx';
const exports = 'auto';
const deps = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
];
const external = (id) => deps.includes(id) || id.startsWith('antd');
const plugins = (isESM) => [
  typescript(),
  !isESM && replace({ preventAssignment: true, '/es/': '/lib/' }),
  less({ insert: true, output: false }),
];

export default [
  {
    input,
    output: { file: pkg.main, format: 'cjs', exports },
    external,
    plugins: plugins(false),
  },
  {
    input,
    output: { file: pkg.module, format: 'es' },
    external,
    plugins: plugins(true),
  },
];
