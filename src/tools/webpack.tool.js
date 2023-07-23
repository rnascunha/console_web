const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    input: path.resolve(__dirname, './input/input.ts'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['input'],
      filename: 'input.html',
      template: path.resolve(__dirname, './input/input.html'),
    }),
  ],
};
