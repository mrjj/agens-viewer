const path = require('path');
const webpack = require('webpack');

module.exports = {
  // mode: 'production',
  mode: 'development',
  module: {
    rules: [
      { test: /\.jpg$/, use: ['file-loader'] },
      { test: /\.png$/, use: ['url-loader?mimetype=image/png'] },
      {
        test: /\.less|\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: 'index.js',
  },
  performance: {
    maxAssetSize: 512 * 1024,
  },
  entry: path.resolve(__dirname, './src/public/index.js'),
};
