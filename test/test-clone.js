const copierName = 'clone';
const deepCopy = require('clone');
const testSuite = require('./test-suite.js');

console.error(`Begin test on "${copierName}" ...`);

if (typeof options !== 'undefined') {
  console.error(`options:`, options);
}

const errors = testSuite(copierName, deepCopy);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
