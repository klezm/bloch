// https://webpack.js.org/configuration/

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
  },
  devtool: 'inline-source-map',
  devServer: {
    // renamed "contentBase" to "static"
    // https://stackoverflow.com/a/69102538/9058671
    // migration guide to v4: https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
    // https://github.com/webpack/webpack-dev-server/issues/2958
    // contentBase: './dist',
    static: './dist',
    // static: path.join(__dirname, 'dist/'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
      // {
      //   test: /\.svg$/,
      //   use: 'file-loader',
      // },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    // restrictions: [/\.(sass|scss|css)$/],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  stats: {
    errorDetails: true,
    // errorStack: true,
  },
};
