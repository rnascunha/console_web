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
    input_with_unit: path.resolve(__dirname, './input-with-unit/test.ts'),
    progress_bar: path.resolve(__dirname, './progress-bar/test.ts'),
    time_line_graph: path.resolve(__dirname, './time-line-graph/test.ts'),
    zoomable: path.resolve(__dirname, './zoomable/test.ts'),
    test: path.resolve(__dirname, './test/test.ts'),
  },

  module: {
    rules: [
      {
        test: /\.csv$/,
        type: 'asset/resource',
      },
    ],
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
      chunks: ['input_with_unit'],
      filename: 'input_with_unit.html',
      template: path.resolve(__dirname, './input-with-unit/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['progress_bar'],
      filename: 'progress_bar.html',
      template: path.resolve(__dirname, './progress-bar/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['time_line_graph'],
      filename: 'time_line_graph.html',
      template: path.resolve(__dirname, './time-line-graph/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['zoomable'],
      filename: 'zoomable.html',
      template: path.resolve(__dirname, './zoomable/test.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['test'],
      filename: 'test.html',
      template: path.resolve(__dirname, './test/test.html'),
    }),
  ],
};
