const copierName = 'deep-copy-all';
const deepCopy = require('../index.js');
const testSuite = require('./test-suite.js');

// Settings
const options = {
  goDeep: true,
  includeNonEnumerable: true
}

console.error(`Begin test on "${copierName}" ...`);

if (options) {
  console.error(`options:`, options);
}

const errors = testSuite(deepCopy, options);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
