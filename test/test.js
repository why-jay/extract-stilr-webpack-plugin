var specialColorCode = require('./specialColorCode');
var webpackConfig = require('./webpack.config');

var expect = require('chai').expect;
var fs = require('fs');
var rimraf = require('rimraf');
var webpack = require('webpack');

var cssFileContent = '';

describe('The plugin', function () {

  before(function (done) {
    // Clear ./dist
    rimraf.sync(__dirname + '/dist');
    fs.mkdirSync(__dirname + '/dist');

    webpack(webpackConfig, function (err) {
      if (err) {
        throw err;
      }

      cssFileContent = fs.readFileSync(__dirname + '/dist/main.css').toString();

      done();
    });
  });

  it('extracts style rules', function () {
    expect(cssFileContent).to.have.string(specialColorCode);
  });

  it('vendor-prefixes rules', function () {
    expect(cssFileContent).to.have.string('webkit');
  });

});
