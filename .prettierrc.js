module.exports = {
  singleQuote: true,

  plugins: [
    require.resolve('@trivago/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-tailwindcss'),
  ],
  pluginSearchDirs: false,

  importOrder: [
    '^react',
    '^antd',
    '^rollup',
    '^@rollup',
    '^vite',
    '^@vite',
    '<THIRD_PARTY_MODULES>',
    'constants',
    'types',
    '^[./]',
  ],
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderCaseInsensitive: true,
};
