var ExtractStilrPlugin = require('../index');

module.exports = {
  context: __dirname,
  entry: {
    main: './entryWithoutStilrStylesheet'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'withoutStilrStylesheet.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new ExtractStilrPlugin({
      filename: 'withoutStilrStylesheet.css'
    })
  ]
};
