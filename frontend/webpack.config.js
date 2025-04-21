const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/, // Handle CSS files
        use: ['style-loader', 'css-loader'], // Apply loaders
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Handle .js and .jsx
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Path to your index.html
    }),
    new webpack.DefinePlugin({
      'window.API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api')
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    host: '0.0.0.0', // Add this line
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
