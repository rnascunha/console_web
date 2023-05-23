const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: [
    path.resolve(__dirname, "./src/css/style.css"),
    path.resolve(__dirname, "./src/ts/index.ts"),
  ],

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/'),
  },

  devtool: 'cheap-module-source-map',

  devServer: {
    port: 3000,
    // un-comment to allow testing from remote devices:
    // host: '0.0.0.0',
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
        // publicPath: './dist/',
      }
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
          options: {
            configFile: "./tsconfig.json",
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      env: JSON.stringify(process.env)
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/index.html")
    }),
  ]
};