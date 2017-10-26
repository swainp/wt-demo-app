var webpack = require('webpack');
var path = require('path');

var web3Provider = process.env.WEB3_PROVIDER || 'http://localhost:8545';

module.exports = {
  context: path.join(__dirname, "app"),
  devtool: "cheap-module-source-map",
  entry: "./index.js",
  watch: true,
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
    path: __dirname + "/app/",
    filename: "index.min.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      'WEB3PROVIDER': JSON.stringify(web3Provider)
    })
  ]
};
