import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import type { RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';

const pkg = JSON.parse(readFileSync('./package.json') as unknown as string);

const input = 'src/ImgCrop.tsx';

const cjsOutput = { file: pkg.main, format: 'cjs', exports: 'auto' } as const;
const esmOutput = { file: pkg.module, format: 'es' } as const;
const dtsOutput = { file: pkg.types, format: 'es' } as const;

const tsPlugin = typescript();
const postcssPlugin = postcss({
  minimize: true,
  inject: (cssVariableName) => `
    (function() {
      if (typeof document === 'undefined') return;
      const style = document.createElement('style');
      const meta = document.querySelector('meta[name="csp-nonce"]');
      if (meta && meta.content) style.setAttribute('nonce', meta.content);
      style.textContent = ${cssVariableName};
      document.head.appendChild(style);
    })();
    `,
});
const replacePlugin = replace({ preventAssignment: true, '/es/': '/lib/' });

const cjsPlugins = [tsPlugin, postcssPlugin, replacePlugin];
const esmPlugins = [tsPlugin, postcssPlugin];

const external = [
  ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  /^react($|\/)/,
  /^antd($|\/)/,
];

const config: RollupOptions[] = [
  { input, output: cjsOutput, plugins: cjsPlugins, external },
  { input, output: esmOutput, plugins: esmPlugins, external },
  { input, output: dtsOutput, plugins: [dts()], external: [/\.css$/] },
];

export default config;
