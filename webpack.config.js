const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  return {
    devtool: 'eval-source-map',
    mode: 'development',
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: "bundle.js"
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html'
      })
    ],
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    devServer: {
      contentBase: __dirname
    }
  };
}
