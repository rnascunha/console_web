const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let commit_hash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const config = {
  extends: [require.resolve('./src/tools/webpack.tool')],
  entry: {
    main: path.resolve(__dirname, './src/ts/main.ts'),
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
        exclude: /editor\.main\.css$/,
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        // monaco-editor
        test: /\.ttf$|\.png/,
        type: 'asset/resource',
      },
      {
        // monaco-editor
        test: /editor\.main\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            exportType: 'css-style-sheet',
          },
        },
      },
      {
        test: /golden\-layout\.less$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              exportType: 'css-style-sheet',
            },
          },
          'less-loader',
        ],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      env: JSON.stringify(process.env),
    }),
    new MonacoWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['main'],
      favicon: path.resolve(__dirname, './favicon.ico'),
      template: path.resolve(__dirname, './src/index.html'),
    }),
    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commit_hash),
    }),
  ],
};

module.exports = (env, args) => {
  if (args.mode === 'development')
    config.extends.push(require.resolve('./src/tests/webpack.test'));
  return config;
};
