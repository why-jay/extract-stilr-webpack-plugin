var ExtractStilrPlugin = require('../index');

module.exports = {
  context: __dirname,
  entry: {
    main: './entry'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new ExtractStilrPlugin({
      filename: 'main.css'
    })
  ]
};
