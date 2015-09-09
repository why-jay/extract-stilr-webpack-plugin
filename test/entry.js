var specialColorCode = require('./specialColorCode');

var stilr = require('stilr');

stilr.create({
  testClass: {
    alignItems: 'center',
    color: specialColorCode
  }
});

module.exports.stilr = stilr;
