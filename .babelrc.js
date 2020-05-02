module.exports = {
  presets: [
    ['@babel/preset-env', { targets: '> 0.25%, not dead', modules: false, loose: true }],
    ['@babel/preset-react', { useBuiltIns: true }],
  ],
};
