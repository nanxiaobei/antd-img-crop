import dts from 'rollup-plugin-dts';
import less from 'rollup-plugin-less';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import type { InputPluginOption, RollupOptions } from 'rollup';

const pkg = JSON.parse(readFileSync('./package.json') as unknown as string);

const input = 'src/index.tsx';

const cjsOutput = { file: pkg.main, format: 'cjs', exports: 'auto' } as const;
const esmOutput = { file: pkg.module, format: 'es' } as const;
const dtsOutput = { file: pkg.types, format: 'es' } as const;

const tsPlugin = typescript();
const replacePlugin = replace({ preventAssignment: true, '/es/': '/lib/' });
const lessPlugin = less({ insert: true, output: false }) as InputPluginOption;

const cjsPlugins = [tsPlugin, replacePlugin, lessPlugin];
const esmPlugins = [tsPlugin, lessPlugin];

const external = [
  ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  /^react($|\/)/,
  /^antd($|\/)/,
];

const config: RollupOptions[] = [
  { input, output: cjsOutput, plugins: cjsPlugins, external },
  { input, output: esmOutput, plugins: esmPlugins, external },
  { input, output: dtsOutput, plugins: [dts()], external: [/\.less$/] },
];

export default config;
