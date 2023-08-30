const { composePlugins, withNx } = require('@nx/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = composePlugins(withNx(), config => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  // config.output.filename = 'main.js'
  // Nx plugins for webpack.
  config.output = {
    filename: '[name].bundle.js',
    clean: true,
    // ...config.output
  };
  config.resolve.modules = ['node_modules', 'src', 'src/client', 'styles'];

  config.module.rules ??= [];
  config.module.rules.push(
    {
      test: /\.global\.css$/,
      use: [
        { loader: MiniCssExtractPlugin.loader },
        {
          loader: 'css-loader',
          options: {
            sourceMap: false,
            modules: {
              mode: 'global',
              localIdentName: '[path][name]__[local]--[hash:base64:5]'
            },
            importLoaders: 1
          }
        },
        'postcss-loader'
      ]
    },

    {
      test: /^((?!\.global).)*\.css$/,
      use: [
        { loader: MiniCssExtractPlugin.loader },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: true,
            sourceMap: false,
            modules: {
              mode: 'local',
              localIdentName: '[path][name]__[local]--[hash:base64:5]'
            }
          }
        },
        'postcss-loader'
      ]
    },
    { test: /\.pug$/, loader: 'pug-loader' }
  );
  config.plugins = [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: './src/reportTemplate.pug',
      inject: false,
      minify: 'auto'
    })
  ].concat(config.plugins ?? []);
  config.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()]
  };

  return config;
});
