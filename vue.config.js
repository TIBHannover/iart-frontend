const webpack = require('webpack');

module.exports = {
  publicPath: '/',
  configureWebpack: {
    devServer: {
      contentBasePublicPath: '/',
      publicPath: '/',
      watchOptions: {
        ignored: [/node_modules/, /public/],
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        'introJs': ['intro.js']
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
  devServer: {
    disableHostCheck: true,
  },

  lintOnSave: true
}
