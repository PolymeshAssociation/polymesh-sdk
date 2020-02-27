/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack.base');

const SANDBOX_FILE_NAME = 'sandbox.ts';

const sandboxFilePath = path.resolve(`./${SANDBOX_FILE_NAME}`);

if (!fs.existsSync(sandboxFilePath)) {
  fs.writeFileSync(
    sandboxFilePath,
    "import { Polymesh } from './src/Polymesh';\n\n// Your code start here...\n"
  );
}

const devConfig = merge.smart(baseConfig, {
  entry: path.resolve(__dirname, SANDBOX_FILE_NAME),
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: 'tsconfig-dev.json',
        },
      },
    ],
  },

  devServer: {
    // This is not written to the disk, but has to be named anyways
    contentBase: path.join(__dirname, 'dist'),
    watchContentBase: true,
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
  ],
  output: {
    pathinfo: true,
    filename: 'devServer.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  node: {
    fs: 'empty',
  },
});

module.exports = devConfig;
