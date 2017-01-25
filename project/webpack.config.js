const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const DefinePlugin = webpack.DefinePlugin

const NODE_ENV = getEnvVar('NODE_ENV', 'development')
const ENV_IS_PRODUCTION = NODE_ENV === 'production'
const DEBUG = !ENV_IS_PRODUCTION

const PATHS = {
  static: path.join(__dirname, 'static'),
  src: path.join(__dirname, 'source')
}

const COPY_PATHS = [{
  from: 'assets/**/*'
}]

const AUTOPREFIXER_CONFIG = {
  remove: false,
  browsers: ['> 1%', 'last 2 versions']
}

const WEBPACK_ENV = {
  NODE_ENV: JSON.stringify(NODE_ENV),
  DEBUG: JSON.stringify(DEBUG)
}

module.exports = {
  context: PATHS.src,
  debug: DEBUG,
  devtool: null,
  target: 'web',

  entry: {
    main: [
      'babel-polyfill',
      'eventsource-polyfill',
      'webpack-hot-middleware/client?path=http://localhost:8080/__webpack_hmr',
      './js/init.js'
    ]
  },
  output: {
    path: PATHS.static,
    filename: 'js/[name].js',
    publicPath: 'static'
  },

  module: {
    loaders: createWebpackLoaders()
  },

  plugins: createWebpackPlugins(),

  postcss () {
    return [
      autoprefixer(AUTOPREFIXER_CONFIG)
    ]
  }
}

// ..................................................

function getEnvVar (key, defaultValue) {
  const value = process.env[key]
  return value != null ? value : defaultValue
}

function createWebpackLoaders () {
  const loaders = [{
    test: /\.svg$/,
    loader: 'svg-sprite'
  }, /*{
    test: /\.(otf|ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
    loader: 'file?name=public/fonts/[name].[ext]'
  },*/ {
    test: /\.(ogg|mp?4a|mp3)$/,
    loader: 'file'
  }, {
    test: /\.(jpg|png)$/,
    loader: 'file'
  }, {
    test: /\.json$/,
    loader: 'json'
  }]

  return loaders
}


function createWebpackPlugins () {
  const plugins = [
    new DefinePlugin({ 'process.env': WEBPACK_ENV }),
    new CopyWebpackPlugin(COPY_PATHS)
  ]
  
  return plugins
}
