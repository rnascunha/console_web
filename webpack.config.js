const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let commit_hash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/ts/main.ts'),
    test: path.resolve(__dirname, './src/tools/test/input.ts'),
    input: path.resolve(__dirname, './src/tools/input/input.ts'),
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  devtool: 'cheap-module-source-map',

  devServer: {
    port: 3000,
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
      },
    ],
    devMiddleware: {
      writeToDisk: true,
    },
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      env: JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      chunks: ['main'],
      favicon: path.resolve(__dirname, './favicon.ico'),
      template: path.resolve(__dirname, './src/index.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['test'],
      filename: 'test.html',
      favicon: path.resolve(__dirname, './favicon.ico'),
      template: path.resolve(__dirname, './src/tools/test/input.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['input'],
      filename: 'input.html',
      favicon: path.resolve(__dirname, './favicon.ico'),
      template: path.resolve(__dirname, './src/tools/input/input.html'),
    }),
    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commit_hash),
    }),
  ],
};
