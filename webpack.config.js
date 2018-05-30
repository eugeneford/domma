path = require('path');

module.exports = {
  entry: ['./src/domma'],
  output: {
    filename: './dist/domma.js',
    library: 'domma',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  devtool: 'source-map',
  externals: ["anodum"],
  module: {
    loaders: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'src/')
      ],
      loader: 'babel-loader'
    }]
  },

  resolve: {
    extensions: ['.js']
  }
};
