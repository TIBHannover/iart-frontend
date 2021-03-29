module.exports = {
  publicPath: '/',
  configureWebpack: {
    devServer: {
      contentBasePublicPath: '/',
      publicPath: '/',
      watchOptions: {
        ignored: [/node_modules/, /public/],
      }
    }
  },
  devServer: {
    disableHostCheck: true,
  },

  lintOnSave: false
}