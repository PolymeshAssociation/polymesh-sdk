/* eslint-disable */
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const SANDBOX_FILE_NAME = 'sandbox.ts';

const sandboxFilePath = path.resolve(`./${SANDBOX_FILE_NAME}`);

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
      {
        test: /\.m?js$/,
        include: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  exclude: ['transform-exponentiation-operator'],
                },
              ],
            ],
            plugins: [
              '@babel/plugin-transform-modules-commonjs',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.js$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
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
    new CaseSensitivePathsPlugin(),
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
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
};

module.exports = devConfig;
