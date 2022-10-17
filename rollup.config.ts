import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import less from 'rollup-plugin-less';
import pkg from './package.json' assert { type: 'json' };

const input = 'src/ImgCrop.tsx';
const deps = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
];
const external = (id) => deps.includes(id) || id.startsWith('antd');
const plugins = [typescript(), less({ insert: true, output: false })];

export default [
  {
    input,
    output: { file: pkg.main, format: 'cjs', exports: 'auto' },
    external,
    plugins: [
      ...plugins,
      replace({
        preventAssignment: true,
        '/es/': '/lib/',
        'LocaleReceiver, null': 'LocaleReceiver.default, null',
      }),
    ],
  },
  {
    input,
    output: { file: pkg.module, format: 'es' },
    external,
    plugins,
  },
];
