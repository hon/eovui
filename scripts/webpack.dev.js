const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");

module.exports = merge(common, {
  mode: 'development',
  experiments: {
    outputModule: false,
  },
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  output: {
    library: {
      // window.shuiRating
      // name: "shuiRating",
      // 开发模式下打包成了commonjs
      // 因为web/test-runner无法支撑commonjs，所以在webpack.common.js里设置了type为"module"
      // 而如果为module时，浏览器端又出现了问题，所以这里改成commonjs
      type: "commonjs"
    },
  },
  plugins:[
    new webpack.DefinePlugin({
      // 设置__DEV__变量的目的是为了能够在项目源码里面知道当前编译是否为开发模式，然后做响应的处理
      // 需要在types下添加global.d.ts，并声明__DEV__变量
      __DEV__: JSON.stringify(true),
    })
  ],
});
