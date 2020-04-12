const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OpimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');


module.exports = env => {
  return {
    devtool: 'source-map',
    mode: 'production',
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: "bundle.js"
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserJSPlugin({}), new OpimizeCSSAssetsPlugin({})]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: 'index.html'
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css"
      })
    ],
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    }
  };
}
