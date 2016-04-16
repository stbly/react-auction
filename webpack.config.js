var Promise = require('es6-promise');
var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var bundletracker = require('webpack-bundle-tracker');
require('babel-polyfill');


module.exports = {

  entry: [
    'babel-polyfill',
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?path=http://localhost:8080/__webpack_hmr',
    './project/js/init.js'
  ],

  output: {
    path: path.join(__dirname,'deploy'),
    filename: 'bundle.js',
    publicPath: '/'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'project/js'),
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.scss$/,
        loaders :
        [
            'style-loader',
            'css-loader?importLoaders=2&sourceMap',
            'postcss-loader',
            'sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true'
        ],
        include: path.join(__dirname, 'project/stylesheets')
      },
      {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'file?name=public/fonts/[name].[ext]',
          include: path.join(__dirname, 'project/fonts')
      },
      {
          test: /\.(png|jpg|gif)$/,
          loader: 'url-loader?limit=8192&context=/images&name=images/[name].[ext]'
      },
      {
          test: /\.svg$/,
          loader: 'svg-sprite?' + JSON.stringify({
              name: '[name]_[hash]'
          }),
          include: path.join(__dirname, 'project/icons')
      }
    ],
    postcss: function () {
      return [autoprefixer];
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.ProvidePlugin({
            'Promise': 'imports?this=>global!exports?global.Promise!es6-promise'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
                BROWSER: JSON.stringify(true)
            }
        }),
        new bundletracker({filename: './webpack-stats.json'})
    ]
  }
}