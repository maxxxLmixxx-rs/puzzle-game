const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const optimization = () => {
  const config = { splitChunks: { chunks: 'all' } }; 
  if (!isDev) config.minimizer = [
    new OptimizeCssAssetsPlugin(),
    new TerserWebpackPlugin()
  ]; return config;
};

const cssLoader = (extra = []) => {
  const config = [{
    loader: MiniCssExtractPlugin.loader,
    options: { hmr: isDev, reloadAll: true }
  }, 'css-loader'];
  if (extra) config.push(...extra);
  return config;
};

const babelLoader = (extra = []) => {
  const config = {
    loader: 'babel-loader',
    options: { presets: ['@babel/preset-env'] }
  };
  if (extra) config.options.presets.push(...extra);
  return config;
};

module.exports = {
  context: path.resolve(__dirname, 'source'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './index.js'],
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@assets': path.resolve(__dirname, 'source/assets'),
      '@images': path.resolve(__dirname, 'source/assets/images'),
      '@fonts' : path.resolve(__dirname, 'source/assets/fonts'),
      '@css'   : path.resolve(__dirname, 'source/css'),
      '@js'    : path.resolve(__dirname, 'source/js'),
      '@'      : path.resolve(__dirname, 'source')
    }
  },
  optimization: optimization(),
  devServer: {
    port: 5500,
    open: true,
    hot: isDev,
    liveReload: true,
    disableHostCheck: true
  },
  devtool: isDev ? 'source-map' : '',
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: { collapseWhitespace: !isDev }
    }),
    new ESLintPlugin(),
    new StylelintPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: filename('css') }),
    // new CopyWebpackPlugin([ { from: '', to: ''}, { from: '', to: ''} ])
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoader([])
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoader(['resolve-url-loader', 'sass-loader'])
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      },
      {
        test: /\.js$/,
        use: babelLoader([]),
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        use: babelLoader(['@babel/preset-typescript']),
        exclude: /node_modules/
      },
      {
        test: /\.jsx$/,
        use: babelLoader(['@babel/preset-react']),
        exclude: /node_modules/
      }
    ]
  }
}