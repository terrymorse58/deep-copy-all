const copierName = 'deep-copy-all';
const deepCopy = require('../dist/deepCopyAll.min.js');
const testSuite = require('./test-suite.js');

// Settings
const options = {
  goDeep: true,
  includeNonEnumerable: true,
  detectCircular: true
}

console.error(`Begin test on "${copierName}" ...`);

if (options) {
  console.error(`options:`, options);
}

const errors = testSuite(copierName, deepCopy, options);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
