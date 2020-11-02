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
    options: { hmr: isDev, reloadAll: true },
  }, 'css-loader'];
  if (extra) config.push(...extra);
  return config;
};

const pagesHTMLWebpackPlugin = (pagesArray) => {
  return pagesArray.map(title => {
    return new HTMLWebpackPlugin({
      title, filename: 'index.html',
      minify: { collapseWhitespace: !isDev },
      template: `./pages/${title.toLowerCase()}/index.html`
    });
  });
}

const babelLoader = (presets = [], plugins = []) => {
  const config = {
    loader: 'babel-loader',
    options: { 
      // presets: ['@babel/preset-env', ...presets],
      presets: [...presets],
      plugins: [...plugins]
    }
  }; return config;
};

module.exports = {
  context: path.resolve(__dirname, 'source'),
  mode: 'development',
  entry: {
    // BABEL ? main: ['@babel/polyfill', './_index.js'],
    //         main: ['./_index.js'],
    main: ['@babel/polyfill', './_index.js'],
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
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
    new ESLintPlugin(),
    new StylelintPlugin(),
    new CleanWebpackPlugin(),
    ...pagesHTMLWebpackPlugin(['Puzzle']),
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
        //? test: /\.(ts|js)$/,
        //? use: ['ts-loader'], 
        //? exclude: /node_modules/

        test: /\.ts$/,
        use: babelLoader(['@babel/preset-typescript']),
        exclude: /node_modules/
      },
      // BABEL ? {
      // BABEL ?   test: /\.jsx$/,
      // BABEL ?   use: babelLoader(['@babel/preset-react']),
      // BABEL ?   exclude: /node_modules/
      // BABEL ? }
    ]
  }
}