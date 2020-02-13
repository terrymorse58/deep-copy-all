const copierName = 'cloneextend';
const deepCopy = require('cloneextend').clone;
const testSuite = require('./test-suite.js');

const options = null;

console.error(`Begin test on "${copierName}" ...`);

if (options) {
  console.error(`options:`, options);
}

const errors = testSuite(copierName, deepCopy);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
