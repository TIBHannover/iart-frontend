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
  },
  devServer: {
    disableHostCheck: true,
  },

  lintOnSave: true
}
