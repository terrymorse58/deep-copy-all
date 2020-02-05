const copierName = 'deep-copy-all';
const deepCopy = require('../index.js');
const testSuite = require('./test-suite.js');

// Settings
const options = {
  goDeep: true,
  includeNonEnumerable: true
}

console.log(`Begin test on "${copierName}" ...\n`);

testSuite(deepCopy);