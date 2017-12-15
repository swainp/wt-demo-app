var webpack = require('webpack');
var path = require('path');

var WEB3_PROVIDER = process.env.WEB3_PROVIDER || 'https://ropsten.infura.io/WKNyJ0kClh8Ao5LdmO7z';
var LIFTOKEN_ADDRESS = "0xB6e225194a1C892770c43D4B529841C99b3DA1d7";
var WTINDEX_ADDRESS = "0x787593b0A1020FD796312B5D284Ee64a0947cc52";
var WTINDEX_BLOCK = 2247290;
var MAPS_API = "AIzaSyAmxaZIZKNk2jBChEOpSBSTI1SGLXLAhM0";

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
      }
    ]
  },
  output: {
    path: __dirname + "/build/",
    filename: "index.min.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      'WEB3_PROVIDER': JSON.stringify(WEB3_PROVIDER),
      'LIFTOKEN_ADDRESS': JSON.stringify(LIFTOKEN_ADDRESS),
      'WTINDEX_ADDRESS': JSON.stringify(WTINDEX_ADDRESS),
      'WTINDEX_BLOCK': WTINDEX_BLOCK,
      'MAPS_API': JSON.stringify(MAPS_API)
    })
  ]
};
