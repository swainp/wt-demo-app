var webpack = require('webpack');
var path = require('path');

var WEB3_PROVIDER = process.env.WEB3_PROVIDER || 'https://kovan.infura.io/WKNyJ0kClh8Ao5LdmO7z';
var LIFTOKEN_ADDRESS = "0x7B7aFbd70662aAbc56382AC174261255627524ef";
var WTINDEX_ADDRESS = "0xe4c4dd9aa1c0108db70315146035cd77e02a4476";

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
      'WTINDEX_ADDRESS': JSON.stringify(WTINDEX_ADDRESS)
    })
  ]
};
