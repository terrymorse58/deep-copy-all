const copierName = 'clone';
const deepCopy = require('clone');
const testSuite = require('./test-suite.js');

// Settings
const options = {
  includeNonEnumerable: true
}

console.error(`Begin test on "${copierName}" ...`);

testSuite(deepCopy, options);

console.error(`Test on "${copierName}" complete.\n`);
