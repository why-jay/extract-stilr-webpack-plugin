var path = require('path');
var findRoot = require('find-root');
var rootDir = findRoot(process.cwd());

module.exports = function getPackageJson() {
  return require(path.join(rootDir, 'package.json'))
};
