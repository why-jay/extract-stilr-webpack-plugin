var specialColorCode = require('./specialColorCode');

var expect = require('chai').expect;
var fs = require('fs');
var loaderUtils = require('loader-utils');
var rimraf = require('rimraf');
var webpack = require('webpack');

describe('The plugin', function () {

  before(function () {
    // Clear ./dist
    rimraf.sync(__dirname + '/dist');
    fs.mkdirSync(__dirname + '/dist');
  });

  describe('in without-stilrStylesheet mode', function () {

    var cssFileContent = '';
    var webpackStats = {};

    before(function (done) {
      var webpackConfig = require('./webpackConfigForWithoutStilrStylesheet');
      webpack(webpackConfig, function (err, stats) {
        if (err) {
          throw err;
        }

        cssFileContent =
          fs.readFileSync(__dirname + '/dist/withoutStilrStylesheet.css')
            .toString();

        webpackStats = stats.toJson();

        done();
      });
    });

    it('extracts style rules', function () {
      expect(cssFileContent).to.have.string(specialColorCode);
    });

    it('vendor-prefixes rules', function () {
      expect(cssFileContent).to.have.string('webkit');
    });

    it('includes the CSS file in designated chunk', function () {
      expect(webpackStats.chunks[0].files)
        .to.include('withoutStilrStylesheet.js');
    });

  });

  describe('in with-stilrStylesheet mode', function () {

    var cssFileContent = '';
    var jsFileContent = '';
    var webpackStats = {};

    before(function (done) {
      var webpackConfig = require('./webpackConfigForWithStilrStylesheet');
      webpack(webpackConfig, function (err, stats) {
        if (err) {
          throw err;
        }

        cssFileContent =
          fs.readFileSync(__dirname + '/dist/withStilrStylesheet.css')
            .toString();

        jsFileContent =
          fs.readFileSync(__dirname + '/dist/withStilrStylesheet.js')
            .toString();

        webpackStats = stats.toJson();

        done();
      });
    });

    it('moves exports.stilrStylesheet to designated file', function () {
      expect(cssFileContent).to.have.string(specialColorCode);
    });

    it("doesn't include the CSS in the JS file", function () {
      expect(jsFileContent).to.not.have.string(specialColorCode);
    });

    it('updates the compilation hash', function () {
      var expectedHash = loaderUtils.getHashDigest(jsFileContent);
      expect(webpackStats.hash).to.be.equal(expectedHash);
    });

    it('includes the CSS file in designated chunk', function () {
      expect(webpackStats.chunks[0].files)
        .to.include('withStilrStylesheet.js');
    });

    it("updates the JS file's hash", function () {
      var expectedHash = loaderUtils.getHashDigest(jsFileContent);
      expect(webpackStats.chunks[0].hash).to.be.equal(expectedHash);
    });

  });


});
