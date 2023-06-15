const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "./src/ts/main.ts"),
    input: path.resolve(__dirname, "./src/ts/input.ts"),
  },

  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  devtool: "cheap-module-source-map",

  devServer: {
    port: 3000,
    static: [
      {
        directory: path.resolve(__dirname, "dist"),
      },
    ],
    devMiddleware: {
      writeToDisk: true,
    },
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: {
          loader: "ts-loader",
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
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      env: JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      chunks: ["main"],
      template: path.resolve(__dirname, "./src/index.html"),
    }),
    new HtmlWebpackPlugin({
      chunks: ["input"],
      filename: "input.html",
      template: path.resolve(__dirname, "./src/input.html"),
    }),
  ],
};
