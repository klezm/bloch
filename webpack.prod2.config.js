// https://webpack.js.org/configuration/
// https://createapp.dev/

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    // new CopyPlugin({
    //   patterns: [{ from: 'src/index.html' }],
    // }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      // templateContent: ({ htmlWebpackPlugin }) =>
      //   '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' +
      //   htmlWebpackPlugin.options.title +
      //   '</title></head><body><div id="app"></div></body></html>',
      filename: 'index.html',
    }),
    new CleanWebpackPlugin(),
  ],
};
