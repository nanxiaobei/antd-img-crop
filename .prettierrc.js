module.exports = {
  singleQuote: true,

  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
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
