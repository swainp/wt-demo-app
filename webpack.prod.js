const webpack = require('webpack');
const merge = require('webpack-merge');

const webpackConfig = require('./webpack.config');

module.exports = merge(webpackConfig, {
  devtool: "source-map",
});