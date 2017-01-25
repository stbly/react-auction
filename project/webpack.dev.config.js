const config = require('./webpack.config')

const webpack = require('webpack')
const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleTracker = require('webpack-bundle-tracker')
const Promise = require('es6-promise')
const DefinePlugin = webpack.DefinePlugin
const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin
const NoErrorsPlugin = webpack.NoErrorsPlugin
const ProvidePlugin = webpack.ProvidePlugin

function defineWebpackDevtool () {
  return ENV_IS_PRODUCTION ? null : 'cheap-source-map'
}

function createWebpackLoaders () {
  const loaders = [{
      test: /\.js?/,
      loaders: ['react-hot', 'babel'],
      include: path.join(config.context, 'js')
  },
   // BUG: Fonts were not loading without using ExtractTextPlugin
  {
    test: /\.scss$/,
    loaders: [
      'style-loader',
      'css-loader?importLoaders=2&sourceMap',
      'postcss-loader',
      'sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true'
    ],
    include: path.join(config.context, 'stylesheets')
  }
  /*{
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract('style',
      'css?sourceMap!postcss!sass'),
    include: path.join(config.context, 'stylesheets')
  }*/]

  return loaders
}


function createWebpackPlugins () {
  const plugins = [
    new ExtractTextPlugin('css/bundle.css', { allChunks: true }),
    new HotModuleReplacementPlugin(),
    new NoErrorsPlugin(),
    new ProvidePlugin({
      'Promise': 'imports?this=>global!exports?global.Promise!es6-promise'
    }),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        BROWSER: JSON.stringify(true)
      }
    }),
    new BundleTracker({
      filename: './webpack-stats.json'
    })
  ]

  return plugins
}

config.devtool = 'cheap-source-map'
config.output.filename = 'js/bundle.js'
config.output.publicPath = '/static/'
config.module.loaders.push(...createWebpackLoaders())
config.plugins.push(...createWebpackPlugins())

module.exports = config
