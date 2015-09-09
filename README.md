# extract-stilr-webpack-plugin

This plugin extracts the style rules that are observed **in the initial state of
the application** into a CSS file, which you can use for production environment.
The rules are vendor-prefixed, using Autoprefixer.

## Example

Given the following files:

```JS
// webpack.config.js

var ExtractStilrPlugin = require('extract-stilr-webpack-plugin');

module.exports = {
  entry: {
    main: './entry' // Note this chunk's name is "main".
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js',
    
    // output.libraryTarget MUST BE "umd"!
    // The reason is explained in the next file.
    // If output.libraryTarget is not "umd", this plugin will throw an Error and
    // refuse to run.
    libraryTarget: 'umd'
  },
  plugins: [
    new ExtractStilrPlugin({
      // options
      
      // options.chunkName has to match the name of the chunk that you want to
      // execute Stilr in and extract the rendered stylesheet.
      //
      // If you don't specify this option yourself, the default value is "main".
      chunkName: 'main',
      
      // options.filename defines the file name of the CSS file that is
      // generated.
      //
      // You can use to keywords.
      // [projname] will read in your project's package.json and replace itself
      // with the project name.
      // [hash] will replace itself with the hash of the CSS content.
      //
      // If you don't specify this option yourself, the default value is
      // "[projname].[hash].css".
      filename: '[projname].[hash].css'
    })
  ]
};
```
```JS
// entry.js

var stilr = require('stilr');

stilr.create({
  testClass: {
    alignItems: 'center',
    color: '#a9f23e'
  }
});

// The entry file of your target chunk MUST EXPORT property exports.stilr, which
// must hold a reference to what is returned by `require('stilr')`.
//
// The plugin uses this reference to render the stylesheet.
//
// This is why `output.libraryTarget` has to be "umd" in your webpack config.
// In other library target modes, running the code in entry.js and then
// importing its exports doesn't work.
module.exports.stilr = stilr;
```

You'll get the following CSS file when you run `webpack`:

```CSS
/* YourProjName.v0q23f0q39jqp23fj0q.css */

._rEl7H{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;color:#a9f23e;}
```

## What do you mean by "in the initial state of the application"?

This plugin works by *actually running* your application inside a VM.
With that in mind, let's take a look at the following example app code.

```JSX
class App extends React.Component {
  state = {
    showBlueText: false
  };
  render() {
    var styles = stilr.create({
      topDiv: {
        color: this.state.showBlueText ? 'blue' : 'black'
      }
    });
    return (
      <div
          className={styles.topDiv}
          onClick={() => this.setState({showBlueText: true})}>
        Text
      </div>
    );
  }
}

React.render(<App />, document.body);
```

In order for this code to work across both states (`showBlueText === true` and
`showBlueText === false`), you would need to extract both styles: `{color:
blue;}` and `{color: black;}`.
But since this plugin works by running the code once in the initial application
state, the state `showBlueText === true` is never reached, and therefore the
style `{color: blue;}` is never extracted.
So the text won't appear blue, despite your intention, because of the way this
plugin works.

How can we fix that code to make it work with this plugin then?
The simple, easy answer is to use `style` instead of `className`: 

```JSX
<div style={color: this.state.showBlueText ? 'blue' : 'black'}
```

This approach works for simple cases such as when all you're defining is
`color`.
But what if your style definition were more complex and you wanted to take
advantages that this plugin provides: vendor prefixing, faster page rendition,
etc.?
In this case, what you should do is to define in advance your styles for all
possible states:

```JSX
render() {
  var styles = stilr.create({
    topDiv_blueText: {
      color: 'blue'
    },
    topDiv_noBlueText: {
      color: 'black'
    }
  });
  return (
    <div
        className={this.state.showBlueText ?
          styles.topDiv_blueText : styles.topDiv_noBlueText}
        onClick={() => this.setState({showBlueText: true})}>
      Text
    </div>
  );
}
```
