const copierName = 'deepcopy';
const deepCopy = require('deepcopy');
const testSuite = require('./test-suite.js');

console.error(`Begin test on "${copierName}" ...`);

const errors = testSuite(copierName, deepCopy);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
