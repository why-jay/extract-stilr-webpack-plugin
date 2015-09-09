var getPackageJson = require('./getPackageJson');

var _ = {
  isArray: require('lodash.isarray'),
  isString: require('lodash.isstring')
};
var autoprefixer = require('autoprefixer');
var evaluate = require('eval');
var jsdom = require('jsdom');
var loaderUtils = require('loader-utils');
var postcss = require('postcss');

var packageJson = getPackageJson();

function Plugin(options) {
  this.options = options || {};
  this.options.chunkName = this.options.chunkName || 'main';
  this.filenameBeforeInterpolation =
    this.options.filename || '[projname].[hash].css';
}

Plugin.prototype.apply = function (compiler) {

  var self = this;

  if (compiler.options.output.libraryTarget !== 'umd') {
    throw new Error('extract-stilr-webpack-plugin:' +
      ' If you want to use this plugin, output.libraryTarget in your webpack' +
      ' configuration must be "umd".');
  }

  compiler.plugin('emit', function(compiler, callback) {
    self.stats = compiler.getStats().toJson();

    var assetsInTargetChunk =
      self.stats.assetsByChunkName[self.options.chunkName];
    var mainJSFileNameOfTargetChunk;
    if (_.isString(assetsInTargetChunk)) {
      mainJSFileNameOfTargetChunk = assetsInTargetChunk;
    } else if (_.isArray(assetsInTargetChunk)) {
      mainJSFileNameOfTargetChunk = assetsInTargetChunk[0];
    } else {
      throw new Error('extract-stilr-webpack-plugin:' +
        'Cannot get the name of the main JS file of the target chunk');
    }
    var source = compiler.assets[mainJSFileNameOfTargetChunk].source();

    var virtualWindowObj = jsdom.jsdom('').defaultView;
    var evalScope = virtualWindowObj;
    evalScope.window = virtualWindowObj;

    var evalResult = evaluate(
      source,
      undefined, // filename
      evalScope, // scope
      true // includeGlobals
    );

    var stilrStylesheet =
      postcss(autoprefixer()).process(evalResult.stilr.render()).css;

    var interpolatedFilename =
      self.filenameBeforeInterpolation
        .replace(/\[projname]/g, packageJson.name)
        .replace(
          /\[(?:(\w+):)?hash(?::([a-z]+\d*))?(?::(\d+))?\]/ig,
          function() {
            return loaderUtils.getHashDigest(
              stilrStylesheet,
              arguments[1],
              arguments[2],
              parseInt(arguments[3], 10)
            );
          });

    compiler.assets[interpolatedFilename] = {
      source: function () {
        return stilrStylesheet
      },
      size: function () {
        return stilrStylesheet.length
      }
    };

    callback();

  });

};

module.exports = Plugin;
