/* eslint-disable */
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const SANDBOX_FILE_NAME = 'sandbox.ts';

const sandboxFilePath = path.resolve(`./${SANDBOX_FILE_NAME}`);
const webpack = require('webpack');

if (!fs.existsSync(sandboxFilePath)) {
  fs.writeFileSync(
    sandboxFilePath,
    "import { Polymesh } from './src/Polymesh';\r\n\r\n/**\r\n * Polymesh SDK connection\r\n */\r\nasync function run(): Promise<void> {\r\n  await Polymesh.connect({\r\n    nodeUrl: 'ws://78.47.38.110:9944',\r\n  });\r\n}\r\n\r\nrun();"
  );
}

const devConfig = {
  devtool: 'cheap-module-source-map',
  entry: ['babel-polyfill', path.resolve(__dirname, SANDBOX_FILE_NAME)],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.dev.json',
        },
      },
    ],
  },

  devServer: {
    // This is not written to the disk, but has to be named anyways
    static: path.join(__dirname, 'dist'),
    // Opens the browser when the watcher starts
    open: true,
    // No need for compression on development
    compress: false,
    port: process.env.PORT || 9000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Polymesh SDK - Sandbox',
    }),
    new CaseSensitivePathsPlugin(),
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  output: {
    pathinfo: true,
    filename: 'devServer.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert/'),
    },
  },
};

module.exports = devConfig;
