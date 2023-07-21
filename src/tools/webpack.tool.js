const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    input: path.resolve(__dirname, './input/input.ts'),
    test: path.resolve(__dirname, './test/test.ts'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['input'],
      filename: 'input.html',
      template: path.resolve(__dirname, './input/input.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['test'],
      filename: 'test.html',
      template: path.resolve(__dirname, './test/test.html'),
    }),
  ],
};
