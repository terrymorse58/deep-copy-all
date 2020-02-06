const copierName = 'deep-copy';
const deepCopy = require('deep-copy');
const testSuite = require('./test-suite.js');

console.log(`Begin test on "${copierName}" ...\n`);

testSuite(deepCopy);

console.error(`Test on "${copierName}" complete.\n`);
