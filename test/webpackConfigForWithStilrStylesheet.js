var ExtractStilrPlugin = require('../index');

module.exports = {
  context: __dirname,
  entry: {
    main: './entryWithStilrStylesheet'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'withStilrStylesheet.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new ExtractStilrPlugin({
      filename: 'withStilrStylesheet.css'
    })
  ]
};
