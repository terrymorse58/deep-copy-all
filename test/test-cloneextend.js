const copierName = 'cloneextend';
const deepCopy = require('cloneextend').clone;
const testSuite = require('./test-suite.js');

// Settings
const DEEP = true;
const COPY_NON_ENUMERABLES = true;
const options = {
  goDeep: DEEP,
  includeNonEnumerable: COPY_NON_ENUMERABLES
}

console.log(`Begin test on "${copierName}" ...\n`);

testSuite(deepCopy, options);