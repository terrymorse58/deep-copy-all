const copierName = 'fast-copy-copy';
const deepCopy = require('fast-copy');
const testSuite = require('./test-suite.js');

console.error(`Begin test on "${copierName}" ...`);

const errors = testSuite(copierName, deepCopy);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
