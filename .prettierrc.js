module.exports = {
  singleQuote: true,

  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '^react',
    '^antd',
    '^@rollup',
    '^rollup',
    '<THIRD_PARTY_MODULES>',
    'constants',
    'types',
    '^[./]',
  ],
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderCaseInsensitive: true,
};
