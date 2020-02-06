const copierName = 'deep-copy-all';
const deepCopy = require('../index.js');
const testSuite = require('./test-suite.js');

// Settings
const options = {
  goDeep: true,
  includeNonEnumerable: true
}

console.error(`Begin test on "${copierName}" ...`);

testSuite(deepCopy);

console.error(`Test on "${copierName}" complete.\n`);
