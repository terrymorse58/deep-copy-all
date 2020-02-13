
const copierName = 'JSON.*';
const deepCopy = (src) => JSON.parse(JSON.stringify(src));
const testSuite = require('./test-suite.js');

// Settings
const options = null;

console.error(`Begin test on "${copierName}" ...`);

if (options) {
  console.error(`options:`, options);
}

const errors = testSuite(copierName, deepCopy, options);

if (errors.length) {
  console.error(`${copierName} errors:`, errors);
}

console.error(`Test on "${copierName}" complete.\n`);
