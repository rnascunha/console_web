const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let commit_hash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const common = {
  entry: {
    main: path.resolve(__dirname, './src/ts/main.ts'),
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
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
        test: /editor\.main\.css$|xterm.css$/,
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
      {
        test: /.*.html$/i,
        loader: 'html-loader',
        options: {
          minimize: true,
        },
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

const production = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        exclude: /editor\.main\.css$|xterm.css$/,
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};

const development = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /editor\.main\.css$|xterm.css$/,
      },
    ],
  },
};

module.exports = (env, args) => {
  if (args.mode === 'development') {
    common.extends = [require.resolve('./src/tests/webpack.test')];
    common.module.rules.splice(0, 0, ...development.module.rules);
    (common.devtool = 'cheap-module-source-map'),
      (common.devServer = {
        port: 3000,
        static: [
          {
            directory: path.resolve(__dirname, 'dist'),
          },
        ],
        devMiddleware: {
          writeToDisk: true,
        },
      });
  } else if (args.mode === 'production') {
    common.module.rules.splice(0, 0, ...production.module.rules);
    common.plugins.splice(0, 0, ...production.plugins);
  } else throw new Error('Mode not defined');
  return common;
};
