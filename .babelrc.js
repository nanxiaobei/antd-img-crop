const { NODE_ENV } = process.env;
const isESMode = NODE_ENV === 'esm';

module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }],
    ['@babel/preset-react', { development: true, useBuiltIns: true }],
  ],
  plugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
    !isESMode && '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-transform-runtime', { useESModules: isESMode }],
    '@babel/plugin-proposal-class-properties',
  ].filter(Boolean),
};
