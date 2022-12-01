import dts from 'rollup-plugin-dts';
import less from 'rollup-plugin-less';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json') as unknown as string);

const input = 'src/index.tsx';
const cjsOutput = { file: pkg.main, format: 'cjs', exports: 'auto' };
const esmOutput = { file: pkg.module, format: 'es' };
const dtsOutput = { file: pkg.types, format: 'es' };

const tsPlugin = typescript();
const lessPlugin = less({ insert: true, output: false });
const replacePlugin = replace({
  preventAssignment: true,
  'LocaleReceiver, null': 'LocaleReceiver.default, null',
});
const cjsPlugins = [tsPlugin, lessPlugin, replacePlugin];
const esmPlugins = [tsPlugin, lessPlugin];

const external = [
  ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  'react/jsx-runtime',
  /^antd/,
];

export default [
  { input, output: cjsOutput, plugins: cjsPlugins, external },
  { input, output: esmOutput, plugins: esmPlugins, external },
  { input, output: dtsOutput, plugins: [dts()], external: [/\.less$/] },
];
