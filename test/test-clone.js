const copierName = 'clone';
const deepCopy = require('clone');
const testSuite = require('./test-suite.js');

// Settings
const options = {
  includeNonEnumerable: true
}

console.log(`Begin test on "${copierName}" ...\n`);

testSuite(deepCopy, options);