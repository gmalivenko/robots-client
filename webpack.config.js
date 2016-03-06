var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/app.js',
  output: {
    path: __dirname,
    filename: 'dist/bundle.js',
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: path.join(__dirname, 'es6'),
        query: {
          presets: 'es2015',
        },
      },
    ],
  },
  plugins: [
  ],
  node: {
    fs: 'empty',
    child_process: 'empty',
    readline: 'empty',
  },
  stats: {
    colors: true,
  },
};
