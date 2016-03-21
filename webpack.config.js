var path = require('path');

module.exports = {

  entry: './project/js/init.js',

  output: {
    path: './deploy',
    filename: 'bundle.js',
    publicPath: '/'
  },

  devServer: {
    inline: true,
    contentBase: './deploy'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
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
          test: /\.svg$/,
          loader: 'svg-sprite?' + JSON.stringify({
              name: '[name]_[hash]'
          }),
          include: path.join(__dirname, 'project/icons')
      },
      {
        test:/\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.(woff|ttf|eot|png|jpg|gif)$/,
        loader: 'file-loader?context=/source/images&name=images/[name].[ext]'
      },
      {
        test: /\.(woff|png|jpg|gif)$/,
        loader: 'url-loader?limit=8192&context=/source/images&name=images/[name].[ext]'
      }
    ]
  }
}