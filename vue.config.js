const webpack = require('webpack')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = {
  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ],
  lintOnSave: false,
  configureWebpack: {
    externals: {
      'vue': 'Vue',
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'element-ui':'ELEMENT',
      'axios':'axios',
    },
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        'chart.js': 'chart.js/dist/Chart.js'
      }
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 6
      }),
      // new BundleAnalyzerPlugin(),
      new CompressionPlugin({
        test:/\.js$|\.html$|.\css/,
        threshold: 10240,
        deleteOriginalAssets: false
      })
    ]
  },
  pwa: {
    name: 'Vue Black Dashboard',
    themeColor: '#344675',
    msTileColor: '#344675',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#344675'
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  css: {
    // Enable CSS source maps.
    sourceMap: process.env.NODE_ENV !== 'production'
  }
}
