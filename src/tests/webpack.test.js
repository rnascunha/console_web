const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    split_vertical: path.resolve(__dirname, './split-vertical/test.ts'),
    split_horizontal: path.resolve(__dirname, './split-horizontal/test.ts'),
    dropdown_menu: path.resolve(__dirname, './dropdown-menu/test.ts'),
    resizeable_container: path.resolve(
      __dirname,
      './resizeable-container/test.ts'
    ),
    inputs: path.resolve(__dirname, './inputs/test.ts'),
    test: path.resolve(__dirname, './test/test.ts'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['split_vertical'],
      filename: 'split_vertical.html',
      template: path.resolve(__dirname, './split-vertical/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['split_horizontal'],
      filename: 'split_horizontal.html',
      template: path.resolve(__dirname, './split-horizontal/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['dropdown_menu'],
      filename: 'dropdown_menu.html',
      template: path.resolve(__dirname, './dropdown-menu/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['resizeable_container'],
      filename: 'resizeable_container.html',
      template: path.resolve(__dirname, './resizeable-container/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['inputs'],
      filename: 'inputs.html',
      template: path.resolve(__dirname, './inputs/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['test'],
      filename: 'test.html',
      template: path.resolve(__dirname, './test/test.html'),
    }),
  ],
};
