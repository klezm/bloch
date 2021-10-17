const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    lib: './src/lib.ts',
    // index: './src/index.ts',
  },
  devServer: {
    // contentBase: './dist',
    static: './dist',
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
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   template: 'src/index.html',
    //   // filename: 'index.html',
    //   // inject: 'body',
    // }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    // restrictions: [/\.(sass|scss|css)$/],
  },
  output: {
    library: 'bloch',
    libraryTarget: 'umd',
    filename: '[name].js',
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
    // clean: true,
  },
};
