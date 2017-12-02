var webpack = require('webpack');
var path = require('path');

var web3Provider = process.env.WEB3_PROVIDER || 'https://kovan.infura.io/WKNyJ0kClh8Ao5LdmO7z';

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
      'WEB3PROVIDER': JSON.stringify(web3Provider),
      'LIFTOKENADDRESS': JSON.stringify('0x1F341011a94d21465aE14a5D7Ee92C1d691089A0'),
      'WTINDEXADDRESS': JSON.stringify('0xe4c4dd9aa1c0108db70315146035cd77e02a4476')
    })
  ]
};
