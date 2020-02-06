const copierName = 'cloneextend';
const deepCopy = require('cloneextend').clone;
const testSuite = require('./test-suite.js');

console.log(`Begin test on "${copierName}" ...\n`);

testSuite(deepCopy);

console.error(`Test on "${copierName}" complete.\n`);
