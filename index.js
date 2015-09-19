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
  this.CSSFilenameBeforeInterpolation =
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
    var targetChunk = compiler.chunks.filter(function (chunk) {
      return chunk.name === self.options.chunkName;
    })[0];

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

    var stilrStylesheet;
    if (evalResult.stilr && !_.isString(evalResult.stilrStylesheet)) {

      stilrStylesheet =
        postcss(autoprefixer()).process(evalResult.stilr.render()).css;

    } else if (_.isString(evalResult.stilrStylesheet)) {

      stilrStylesheet = evalResult.stilrStylesheet;

      const jsSourceWithStilrCSSRemoved = source.replace(stilrStylesheet, '');

      delete compiler.assets[mainJSFileNameOfTargetChunk];
      targetChunk.files = targetChunk.files.filter(function (file) {
        return file !== mainJSFileNameOfTargetChunk;
      });

      const newMainJSFilename =
        compiler.options.output.filename
          .replace(/\[name]/g, self.options.chunkName)
          .replace(
            /\[(?:(\w+):)?hash(?::([a-z]+\d*))?(?::(\d+))?\]/ig,
            function() {
              return loaderUtils.getHashDigest(
                jsSourceWithStilrCSSRemoved,
                arguments[1],
                arguments[2],
                parseInt(arguments[3], 10)
              );
            }
          );

      compiler.assets[newMainJSFilename] = {
        source: function () {
          return jsSourceWithStilrCSSRemoved;
        },
        size: function () {
          return jsSourceWithStilrCSSRemoved.length;
        }
      };
      targetChunk.files.push(newMainJSFilename);
      targetChunk.hash =
      targetChunk.renderedHash =
      compiler.hash =
        loaderUtils.getHashDigest(jsSourceWithStilrCSSRemoved);

    } else {

      throw new Error('extract-stilr-webpack-plugin:' +
        'Your entry point must export either property: `exports.stilr` or ' +
        '`exports.stilrStylesheeet');

    }

    var interpolatedCSSFilename =
      self.CSSFilenameBeforeInterpolation
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

    compiler.assets[interpolatedCSSFilename] = {
      source: function () {
        return stilrStylesheet
      },
      size: function () {
        return stilrStylesheet.length
      }
    };
    targetChunk.files.push(interpolatedCSSFilename);

    callback();

  });

};

module.exports = Plugin;
