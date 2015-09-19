var ExtractStilrPlugin = require('../index');

module.exports = {
  context: __dirname,
  entry: {
    main: './entryWithStilrStylesheet_emptyExport'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'withStilrStylesheet_emptyExport.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new ExtractStilrPlugin({
      filename: 'withStilrStylesheet_emptyExport.css'
    })
  ]
};
