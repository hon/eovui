const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const fs = require('fs')


// directory path
const dir = './examples/'
let pages = []
let folders = []

// list all files in the directory
try {
  let files = fs.readdirSync(dir)


  folders = files.filter(el => !el.includes('.'))

} catch (err) {
  console.log(err)
}


module.exports = merge(common, {
  mode: 'development',
  experiments: {
    outputModule: false,
  },
  entry: folders.reduce((config, folder) => {
    config[folder] = `./examples/${folder}/index.ts`
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

  ].concat(folders.map(folder => {
    return new HtmlWebpackPlugin({
      inject: true,
      // title: `${page}`,
      // template file
      template: `${dir}${folder}/index.html`,
      // output file
      // http://localhost:8080/examples/button.html
      filename: `examples/${folder}.html`,
      chunks: [folder],
    })

  }))
});
