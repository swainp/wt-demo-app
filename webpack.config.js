const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = require('./config');

var WEB3_PROVIDER = process.env.WEB3_PROVIDER || config.WEB3_PROVIDER;
var LIFTOKEN_ADDRESS = config.LIFTOKEN_ADDRESS;
var WT_INDEXES = config.WT_INDEXES;
var MAPS_API_KEY = config.MAPS_API_KEY;

module.exports = {
  context: path.join(__dirname, "app"),
  devtool: "cheap-module-source-map",
  entry: "./index.js",
  devServer: {
    historyApiFallback: true,
    contentBase: path.join(__dirname, "app"),
    compress: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['react-html-attrs', 'transform-class-properties'],
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader','raw-loader']
      },
      {
        test: /\.css$/,
        loaders: ['style-loader','raw-loader']
      },
      {
        test: /\.png$/,
        loader: "url-loader",
        query: { mimetype: "image/png" }
      },
      {
        test: /\.svg$/,
        loader: "url-loader"
      },
    ]
  },
  output: {
    path: __dirname + "/build/",
    filename: "index.min.js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: './*.html'},
      {from: './assets', to: 'assets'}
    ]),
    new webpack.DefinePlugin({
      'WEB3_PROVIDER': JSON.stringify(WEB3_PROVIDER),
      'LIFTOKEN_ADDRESS': JSON.stringify(LIFTOKEN_ADDRESS),
      'WT_INDEXES': JSON.stringify(WT_INDEXES),
      'MAPS_API_KEY': JSON.stringify(MAPS_API_KEY)
    })
  ]
};
