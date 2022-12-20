const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const process = require("process")

const execDirName = process.cwd()


module.exports = {
  experiments: {
    outputModule: true,
  },
  entry: {
    index: './src/index.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(execDirName/*__dirname*/, 'dist'),
    clean: true,
    // default assets path and name
    assetModuleFilename: 'assets/[name][ext]',
    library: {
      // 输出window.shuiRating
      //name: "shuiRating",
      type: "module"
    },
  },
  plugins: [
     new HtmlWebpackPlugin({
       template: './index.html'
     }),

    // extract css files into separate files
    new MiniCssExtractPlugin({
      filename: 'assets/style/[name].css',
    }),
  ],
  module: {
    rules: [
      {
        // sass文件用来加载document stylesheet
        test: /\.(sc|sa)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // resource path
              //publicPath: '.'
            }
          }, 
          "css-loader",
          // Translates CSS into CommonJS
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },

      // css 文件用来加载local (constructable) stylesheet
      // 用来给shadow dom 添加样式
      {
        assert: { type: "css" },
        loader: "css-loader",
        options: {
          exportType: "css-style-sheet",
        },
      },
      
      /*
      {
        assert: { type: "css" },
        rules: [
          {
            loader: "css-loader",
            options: {
              exportType: "css-style-sheet",
              // Other options
            },
          },
          {
            loader: "sass-loader",
            options: {
              // Other options
            },
          },
        ],
      },
      */

      /*
      {

        test: /\.(sc|sa|c)ss$/i,
        oneOf: [
          {
            assert: { type: "css" },
            rules: [
              {
                loader: "css-loader",
                options: {
                  exportType: "css-style-sheet",
                  // Other options
                },
              },
              {
                loader: "sass-loader",
                options: {
                  // Other options
                },
              },
            ],
          },
          {
            use: [
              "postcss-loader",
              {
                loader: "css-loader",
                options: {
                  // Other options
                },
              },
              "sass-loader"
            ],
          },
        ],
      },
      */

      // html
      {
        test: /\.html?$/i,
        loader: "html-loader",
        options: {
          // Disables attributes processing
          sources: false,
        },
      },

      // ts
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      // images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          // overwrite default path and name
          filename: 'assets/img/[name][ext][query]'
        }
      },

      // fonts
      {
        test      : /\.(woff2?|ttf|eot)(\?v=\w+)?$/,
        type      : 'asset/resource',
        generator : {
          filename : 'assets/font/[name][ext][query]',
        }
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  /*
  plugins: [
    new webpack.DefinePlugin({
      DEV: JSON.stringify(true),
    })
  ],
  */
};
 
