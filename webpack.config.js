const path = require('path');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');

const clientBundle = {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'zepto-webpack',
    }),
    new WriteFilePlugin(),
  ],
  entry: {
    pennyauth: './index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist', // for webpack dev webserver
    library: 'pennyauth',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: ['@babel/env'],
            },
          },
          { loader: 'eslint-loader', options: { fix: true } },
        ],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
};

// The versionedClientBundle is built alongside the client bundle.
// There is no difference except for the generated filename contains a version (if TAG_NAME is provided) or hash.
const versionedClientBundle = Object.assign({}, clientBundle, {
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist',
    library: 'pennyauth',
  },
});

module.exports = (env) => {
  const tag = env.TAG_NAME || process.env.TAG_NAME;
  const hasTag = typeof tag !== 'undefined' && tag !== '';

  const injectNodeEnv = (part) => {
    part.plugins.push(
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(env.NODE_ENV),
      }),
    );
    return part;
  };

  const addSourcemaps = (part) => {
    // eslint-disable-next-line no-param-reassign
    part.devtool = 'hidden-source-map';
    return part;
  };

  const taggedPart = (part) => {
    if (hasTag) {
      // eslint-disable-next-line no-param-reassign
      part.output = {
        filename: `[name].${tag}.js`,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist',
        library: 'pennyauth',
      };
    }

    return part;
  };

  const frontendParts = [versionedClientBundle].map(taggedPart, injectNodeEnv);

  if (env.NODE_ENV === 'production') {
    return frontendParts.map(addSourcemaps);
  }

  return frontendParts;
};
