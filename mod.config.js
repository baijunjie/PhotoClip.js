// Webpack configuration
module.exports = {
  base: {
    entry: {
      PhotoClip: './src/index.js'
    },
    resolve: {
      alias: {
        'utils': '@module-factory/utils'
      }
    },
    externals: {
      'hammerjs': {
        commonjs: 'hammerjs',
        commonjs2: 'hammerjs',
        amd: 'hammerjs',
        root: 'Hammer'
      },
      'iscroll/build/iscroll-zoom': {
          commonjs: 'iscroll/build/iscroll-zoom',
          commonjs2: 'iscroll/build/iscroll-zoom',
          amd: 'iscroll',
          root: 'IScroll'
      },
      'lrz': 'lrz'
    }
  },

  dev: {
    // https://webpack.js.org/configuration/dev-server/
    devServer: {
      host: 'localhost',
      port: 9000
    }
  },

  prod: {

  }
}