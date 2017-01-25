const config = require('./webpack.config')

const webpack = require('webpack')
const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin
const DedupePlugin = webpack.optimize.DedupePlugin

const UGLIFY_CONFIG = {
  sourceMap: false,
  mangle: true,
  comments: false,
  compress: {
    warnings: false
  }
}

function createWebpackLoaders () {
  const loaders = [{
    test: /\.js?/,
    loader: 'babel-loader',
    query: {
      plugins: ['transform-runtime']
    },
    include: path.join(config.context, 'js')
  },
  {
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract('style',
      'css?sourceMap!postcss!sass'),
    include: path.join(config.context, 'stylesheets')
  }]

  return loaders
}


function createWebpackPlugins () {
  const plugins = [
    new ExtractTextPlugin('css/[name].css', { allChunks: true }),
    new ProgressBarPlugin({ width: 60 }),
    new DedupePlugin(),
    new OccurenceOrderPlugin(),
    new UglifyJsPlugin(UGLIFY_CONFIG)
  ]

  return plugins
}

config.module.loaders.push(...createWebpackLoaders())
config.plugins.push(...createWebpackPlugins())
module.exports = config
