const webpack = require('webpack');
const merge = require('webpack-merge');

const webpackConfig = require('./webpack.config');

module.exports = merge(webpackConfig, {
  devtool: "source-map",
  output: {
    path: __dirname + "/dist/",
    filename: "[name].min.js",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      name: true,
    },
  }
});