const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./../../webpack.common.js');
const webpack = require("webpack");
const fs = require('fs')


// directory path
const dir = './examples/'
let pages = []

// list all files in the directory
try {
  let files = fs.readdirSync(dir)

  files = files.filter(el => el.includes('.html'))

  // files object contains all files names
  files.forEach(file => {
    const ary = file.split('.')
    pages.push(ary[0])
  })
} catch (err) {
  console.log(err)
}


module.exports = merge(common, {
  mode: 'development',
  experiments: {
    outputModule: false,
  },
  entry: pages.reduce((config, page) => {
    config[page] = `./examples/${page}.ts`
    return config
  }, {}),
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
    }),

  ].concat(pages.map(page => {
    return new HtmlWebpackPlugin({
      inject: true,
      // title: `${page}`,
      // template file
      template: `${dir}${page}.html`,
      // output file
      filename: `${page}.html`,
      chunks: [page],
    })

  }))
});
