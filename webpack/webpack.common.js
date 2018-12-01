const Path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'content-generator': Path.resolve(__dirname, '../src/content-generator.js')
  },
  output: {
    path: Path.join(__dirname, '../dist'),
    filename: 'js/[name].js'
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], { root: Path.resolve(__dirname, '..') }),
  ],
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, '../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }
      },
    ]
  }
};
