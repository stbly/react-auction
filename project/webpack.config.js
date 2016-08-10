const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const Promise = require('es6-promise');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const bundletracker = require('webpack-bundle-tracker');

const BundleTracker = require('webpack-bundle-tracker')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const DefinePlugin = webpack.DefinePlugin
const NoErrorsPlugin = webpack.NoErrorsPlugin
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

const CONFIG = {
  static: path.join(__dirname, 'static'),
  src: path.join(__dirname, 'source')
}

const UGLIFY_CONFIG = {
  sourceMap: false,
  mangle: true,
  compress: {
    warnings: false
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development'
const ENV_IS_PRODUCTION = NODE_ENV !== 'development'
const BROWSER = true

console.log('node environment:',process.env.NODE_ENV)

const WEBPACK_ENV = {
  NODE_ENV: JSON.stringify(NODE_ENV),
  BROWSER: JSON.stringify(BROWSER)
}

module.exports = {
  debug: !ENV_IS_PRODUCTION,
  devtool: defineWebpackDevtool(),

  entry: createEntry(),

  output: {
    path: CONFIG.static,
    filename: 'js/bundle.js',
    publicPath: 'static/'
  },

  module: {
    loaders: createWebpackLoaders()
  },

  plugins: createWebpackPlugins(),

  postcss: function () {
    return [autoprefixer];
  }
}

// ..................................................

function defineWebpackDevtool () {
  return ENV_IS_PRODUCTION ? null : 'cheap-module-eval-source-map'
}

function createEntry () {
  var entry;
  if (ENV_IS_PRODUCTION){
    entry = [
      'babel-polyfill',
      './project/source/js/init.js'
    ]
  } else {
    entry = [
      'babel-polyfill',
      'eventsource-polyfill',
      'webpack-hot-middleware/client?path=http://localhost:8080/__webpack_hmr',
      './project/source/js/init.js' // try using CONFIG.src + '/js/init.js'
    ]
  }
  return entry
}

function createWebpackLoaders () {
  var loaders = [{
      test: /\.svg$/,
      loader: 'svg-sprite?' + JSON.stringify({
          name: '[name]_[hash]'
      })
  }, {
    test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
    loader: 'file'
  }, {
    test: /\.(ogg|mp?4a|mp3)$/,
    loader: 'file'
  }, {
    test: /\.(jpg|png)$/,
    loader: 'file',
    query: {
      name: 'images/[name].[ext]'
    }
  },{
    test: /\.json$/,
    loader: 'json',
    query: {
      name: 'images/[name].[ext]'
    }
  }]

  if (ENV_IS_PRODUCTION) {
    loaders.push({
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style',
        'css?sourceMap!postcss!sass'),
      include: CONFIG.src
    },{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules|bower_components/,
      include: CONFIG.src
    })
  } else {
    loaders.push({
      test: /\.(css|scss)$/,
      loaders :
      [
          'style-loader',
          'css-loader?importLoaders=2&sourceMap',
          'postcss-loader',
          'sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true'
      ]
    },{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      exclude: /node_modules|bower_components/,
      include: CONFIG.src
    })
  }

  return loaders;
}

function createWebpackPlugins () {
  const plugins = [
    new DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify( NODE_ENV ),
            BROWSER: JSON.stringify( BROWSER )
        }
    }),
    new BundleTracker({ filename: './webpack-stats.json' })
  ]

  if (ENV_IS_PRODUCTION) {
    plugins.push(
      new ExtractTextPlugin('css/bundle.css', { allChunks: true }),
      new ProgressBarPlugin({ width: 60 }),
      new UglifyJsPlugin(UGLIFY_CONFIG))
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new NoErrorsPlugin())
  }
  return plugins
}
