// test suite for deep copy
const fs = require('fs');

const doBenchmark = false;

function testSuite (copierName, deepCopy, options) {

  let errors = [], status = [];
  let iTest = 0;
  let name = '';
  let cName = copierName || 'status';

  function logErr (err, iTest, name) {
    console.log(`*** TEST${iTest} (${name}) FAILED:`, err);
    errors.push(`Test${iTest} (${name}) `+ err.toString());
    let obj = { type: name };
    obj[cName] = 'Error';
    status.push(obj);
  }

  function postStatus(sType) {
    console.log(`Test${iTest} (${name}): status is "${sType}"`);
    let obj = { type: name };
    obj[cName] = sType;
    status.push(obj);
  }
  const postLoss = () => postStatus('Data Loss');
  const postShallow = () => postStatus('Shallow Copy');
  const postOK = () => postStatus('OK');

  function newTest(newName, callback) {
    iTest++;
    name = newName;
    console.log(`\nTest${iTest} (${name}):`);
    if (callback) {
      callback();
    }
  }

  const starttime = (new Date()).getTime();

  console.log(`Options are set to:`, options);

  // array > Array
  newTest('Array', () => {
    console.log(
      '  let src = [1, 2, 3, [4, 5]];\n' +
      '  let dest = deepCopy(src, options);\n' +
      '  dest[3][1] = 50000;'
    );
    try {
      let src = [1, 2, 3, [4, 5]];
      console.log('    src: ', JSON.stringify(src));
      let dest = deepCopy(src, options);
      console.log('    dest:', JSON.stringify(dest));
      if (!(dest[3] instanceof Array) || dest[3][1] !== 5) {
        return postLoss()
      }
      dest[3][1] = 50000;
      console.log('    dest:', JSON.stringify(dest));
      if (dest[3][1] === src[3][1]) {
        return postStatus('Shallow');
      }
      return postOK();
    } catch (err) { logErr(err, iTest, name); }
  });

  // ArrayBuffer
  newTest('ArrayBuffer', () => {
    console.log(
      '  let aBuf = new ArrayBuffer(8);\n' +
      '  let src = new Uint8Array(aBuf);\n' +
      '  src.set([1, 2, 3], 3);\n' +
      `  let bufCopy = deepCopy(aBuf, ${options});\n` +
      `  let dest = new Uint8Array(bufCopy);\n` +
      `  dest[0] = 128;`
    );
    try {
      let aBuf = new ArrayBuffer(8);
      let src = new Uint8Array(aBuf);
      src.set([1, 2, 3], 3);
      console.log('    aBuf:  ', aBuf);
      let bufCopy = deepCopy(aBuf, options);
      console.log('    bufCopy:', bufCopy);
      let dest = new Uint8Array(bufCopy);
      if (!(bufCopy instanceof ArrayBuffer)
        || bufCopy.length !== aBuf.length
        || dest[3] !== src[3]) {
        return postLoss();
      }
      dest[0] = 128;
      console.log('    dest:  ', bufCopy);
      if (dest[0] === src[0]) {
        return postStatus('Shallow');
      }
      return postOK();
    } catch (err) { logErr(err, iTest, name); }
  });

  // array > BigInt
  newTest('BigInt', () => {
    console.log(
      '  let src = [1, 2, BigInt(3000000)];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      '  dest[2].setMonth(7);'
    );
    try {
      let src = [1, 2, BigInt(3000000)];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (typeof dest[2] !== 'bigint' || dest[2] !== src[2]) {
        return postLoss();
      }
      dest[2] = 9999999n;
      console.log('    dest:', dest);
      if (dest[2] === src[2]) {
        return postShallow();
      }
      postOK();
    } catch (err) { logErr(err, iTest, name); }
  });

// array > BigInt64Array
  newTest('BigInt64Array', () => {
    console.log(
      '  let src = [ 1, 2, BigInt64Array.from([3n, 4n, 42n]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 300000n;`
    );
    try {
      let src = [1, 2, BigInt64Array.from([3n, 4n, 42n])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof BigInt64Array) || dest[2][1] !== src[2][1]) {
        return postLoss();
      }
      dest[2][0] = 300000n;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      postOK();
    } catch (err) { logErr(err, iTest, name); }
  });

// array > BigUint64Array
  newTest('BigUint64Array', () => {
    console.log(
      '  let src = [ 1, 2, BigUint64Array.from([3n, 4n, 42n]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 909090909n;`
    );
    try {
      let src = [1, 2, BigUint64Array.from([3n, 4n, 42n])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof BigUint64Array) || dest[2][0] !== src[2][0]) {
        return postLoss();
      }
      dest[2][0] = 909090909n;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      return postOK();
    } catch (err) { logErr(err, iTest, name); }  });


  // Buffer (node.js)
  newTest('Buffer', () => {
    console.log(
      '  let src = Buffer.from([1, 2, 3]);\n' +
      '  let dest = deepCopy(src);\n' +
      '  dest[0] = 128;'
    );
    try {
      let src = Buffer.from([1, 2, 3]);
      console.log('    src: ', src);
      let dest = deepCopy(src);
      console.log('    dest:', dest);
      if (!(dest instanceof Buffer) || dest.length !== src.length
        || dest[1] !== src[1]) {
        return postLoss();
      }
      dest[0] = 128;
      console.log('    dest:', dest);
      if (dest[0] === src[0]) {
        return postShallow();
      }
      return postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// array > Date
  newTest('Date', () => {
    console.log(
      '  let src = [1, 2, new Date(), 3];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      '  dest[2].setMonth(7);'
    );
    try {
      let src = [1, 2, new Date(), 3];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Date)
        || dest[2].getTime() !== src[2].getTime()) {
        return postLoss();
      }
      dest[2].setMonth(7);
      console.log('    dest:', dest);
      if (dest[2].getMonth() === src[2].getMonth()) {
        return postShallow();
      }
      return postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // Error
  newTest('Error', () => {
    console.log(
      '  let src = new Error("this is an error message");\n' +
      '  let dest = deepCopy(src);'
    );
    try {
      let src = new Error("this is an error message");
      console.log('    src.message: ', src.message);
      console.log('    src.stack: ', src.stack);
      let dest = deepCopy(src);
      console.log('    dest.message:', dest.message);
      console.log('    dest.stack:', dest.stack);
      if (!(dest instanceof Error) || dest.message !== src.message
        || dest.stack !== src.stack) {
        return postLoss();
      }
      dest.message = "New Message";
      console.log('    dest.message:', dest.message);
      if (dest.message === src.message) {
        return postShallow();
      }
      return postOK();
    }  catch (err) { logErr(err, iTest, name); }  });

// Float32Array
  newTest('Float32Array', () => {
    console.log(
      '  let src = [ 1, 2, Float32Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[1] = 16181618;`
    );
    try {
      let src = [1, 2, Float32Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Float32Array)
        || dest[2][2] !== src[2][2]) {
        return postLoss();
      }
      dest[1] = 16181618;
      console.log('    dest:', dest);
      if (dest[1] === src[1] ) {
        return postShallow();
      }
      return postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// Float64Array
  newTest('Float64Array', () => {
    console.log(
      '  let src = [ 1, 2, Float64Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 16181618;`
    );
    try {
      let src = [1, 2, Float64Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Float64Array)
        || dest[2][2] !== src[2][2]) {
        return postLoss();
      }
      dest[2][0] = 16181618;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      return postOK();
    } catch (err) { logErr(err, iTest, name); }
  });


// array > Int8Array
  newTest('Int8Array', () => {
    console.log(
      '  let src = [ 1, 2, Int8Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 128;`
    );
    try {
      let src = [1, 2, Int8Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Int8Array)
        || dest[2][2] !== src[2][2]) {
        return postLoss();
      }
      dest[2][0] = 128;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      return postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// array > Int16Array
  newTest('Int16Array', () => {
    console.log(
      '  let src = [ 1, 2, Int16Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 1024;`
    );
    try {
      let src = [1, 2, Int16Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Int16Array)
        || dest[2][1] !== src[2][1]) {
        return postLoss();
      }
      dest[2][0] = 1024;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0] ) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// array Int32Array
  newTest('Int32Array', () => {
    console.log(
      '  let src = [ 1, 2, Int32Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 16181618;`
    );
    try {
      let src = [1, 2, Int32Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Int32Array)
        || dest[2][2] !== src[2][2]) {
        return postLoss();
      }
      dest[2][0] = 16181618;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0] ) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // Map
  newTest('Map', () => {
    console.log(
      '  let myMap = new Map();\n' +
      '  let keyString = "a string";\n' +
      '  let keyObj = {};\n' +
      '  let keyFunc = function () {};\n' +
      '  myMap.set(keyString, \'value associated with "a string"\');\n' +
      '  myMap.set(keyObj, \'value associated with keyObj\');\n' +
      '  myMap.set(keyFunc, \'value associated with keyFunc\');\n' +
      `  let dest = deepCopy(myMap, ${options});\n` +
      '  dest.delete(keyFunc);'
    );
    try {
      let myMap = new Map();
      let keyString = "a string";
      let keyObj = {};
      let keyFunc = function () {};
      myMap.set(keyString, 'value associated with "a string"');
      myMap.set(keyObj, 'value associated with keyObj');
      myMap.set(keyFunc, 'value associated with keyFunc');
      console.log('    myMap:', myMap);
      let dest = deepCopy(myMap, options);
      console.log('    dest: ', dest);
      if (!(dest instanceof Map)
        || dest.get(keyString) !== myMap.get(keyString)) {
        return postLoss();
      }
      dest.delete(keyFunc);
      console.log('    dest: ', dest);
      if (myMap.get(keyFunc) === undefined) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // array > Object
  newTest('Object', () => {
    console.log(
      '  const src = ["a", 42, { name: "terry", age: "old" }];\n' +
      '  let dest = deepCopy(src, options);\n' +
      '  dest[2].age = "none of your business";'
    );
    try {
      const src = ['a', 42, { name: 'terry', age: 'old' }];
      console.log('    src: ', JSON.stringify(src));
      let dest = deepCopy(src, options);
      console.log('    dest:', JSON.stringify(dest));
      if (!(dest[2] instanceof Object)
        || dest[2].name !== src[2].name) {
        return postLoss();
      }
      dest[2].age = 'none of your business';
      console.log('    dest:', JSON.stringify(dest));
      if (dest[2].age === src[2].age) {
        return postShallow();
      }
      postOK();
    } catch (err) { logErr(err, iTest, name); }
  });


  // array > RegExp
  newTest('RegExp', () => {
    console.log(
      '  let src = [1, 2, /abc/, "foo"];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2] = /123/;`
    );
    try {
      let src = [1, 2, /abc/, "foo"];
      console.log('    src:', src);
      let dest = deepCopy(src, options);
      console.log('    dest: ', dest);
      if (!(dest[2] instanceof RegExp)
        || dest[2].source !== src[2].source) {
        return postLoss();
      }
      dest[2] = /123/;
      console.log('    dest: ', dest);
      if (dest[2].source === src[2].source) {
        return postShallow();
      }
      return postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // Set
  newTest('Set', () => {
    console.log(
      '  let src = new Set([1,"a",2,{foo: "bar"}]);\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      '  dest.add("new stuff");'
    );
    try {
      let src = new Set([1, 'a', 2, { foo: 'bar' }]);
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest instanceof Set)
        || !dest.has('a')) {
        return postLoss();
      }
      dest.add('new stuff');
      console.log('    dest:', dest);
      if (src.has('new stuff')) {
        return postShallow();
      }
      postOK();
    } catch (err) { logErr(err, iTest, name); }
  });

// array > Uint8Array
  newTest('Uint8Array', () => {
    console.log(
      '  let src = [ 1, 2, Uint8Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 127;`
    );
    try {
      let src = [1, 2, Uint8Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Uint8Array)
        || dest[2][2] !== src[2][2]) {
        return postLoss();
      }
      dest[2][0] = 127;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// array > Uint8ClampedArray
  newTest('Uint8ClampedArray', () => {
    console.log(
      '  let src = [ 1, 2, Uint8ClampedArray.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][0] = 64;`
    );
    try {
      let src = [1, 2, Uint8ClampedArray.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Uint8ClampedArray)
        || dest[2][0] !== src[2][0]) {
        return postLoss();
      }
      dest[2][0] = 64;
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// array > Uint16Array
  newTest('Uint16Array', () => {
    console.log(
      '  let src = [ 1, 2, Uint16Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][1] = 1024;`
    );
    try {
      let src = [1, 2, Uint16Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Uint16Array)
        || dest[2][0] !== src[2][0]) {
        return postLoss();
      }
      dest[2][1] = 1024;
      console.log('    dest:', dest);
      if (dest[2][1] === src[2][1] ) {
        return postShallow();
      }
      postOK()
    }  catch (err) { logErr(err, iTest, name); }  });


// Uint32Array
  newTest('Uint32Array', () => {
    console.log(
      '  let src = [ 1, 2, Uint32Array.from([3, 4, 42]) ];\n' +
      `  let dest = deepCopy(src, ${options});\n` +
      `  dest[2][1] = 8192;`
    );
    try {
      let src = [1, 2, Uint32Array.from([3, 4, 42])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof Uint32Array)
        || dest[2][1] !== src[2][1]) {
        return postLoss();
      }
      dest[2][1] = 8192;
      console.log('    dest:', dest);
      if (dest[2][1] === src[2][1] ) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }
  });

  // array > WeakMap
  newTest('WeakMap', () => {
    console.log(
      '  let wm = new WeakMap();\n' +
      '  let obj = { foo: "I am foo" };\n' +
      '  wm.set(obj, 42);\n' +
      '  let src = [1, 2, wm, "bar"];\n' +
      '  console.log(\'    src: \', src);\n' +
      '  let dest = deepCopy(src, options);\n' +
      '  dest[1] = 3.1416;'
    );
    try {
      let wm = new WeakMap();
      let obj = { foo: "I am foo" };
      wm.set(obj, 42);
      let src = [1, 2, wm, "bar"];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof WeakMap)
        || dest[2].get(obj) !== 42) {
        return postLoss();
      }
      dest[2].set(obj, 1618);
      console.log('    dest:', dest);
      if (dest[2].get(obj) === src[2].get(obj)) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // array > WeakSet
  newTest('WeakSet', () => {
    console.log(
      '  let ws = new WeakSet();\n' +
      '    let obj = {value: "in the set"}\n' +
      '    ws.add(obj);\n' +
      '    let src = [1, 2, ws, "bar"];\n' +
      '    let dest = deepCopy(src, options)'
    );
    try {
      let ws = new WeakSet();
      let obj = {value: "in the set"};
      ws.add(obj);
      let src = [1, 2, ws, "bar"];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof WeakSet)
        || !dest[2].has(obj)) {
        return postLoss();
      }
      let obj2 = {foo: "bar"};
      dest[2].add(obj2);
      if (src[2].has(obj2)) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


// object > non-enumerable
  newTest('enumerable:false', () => {
    console.log(
      '  let src = {foo: "this is foo", bar: "this is bar"};\n' +
      '  Object.defineProperty(src, "foo", {enumerable: false});\n' +
      `  let dest = deepCopy(src, ${options});`
    );
    try {
      let src = { foo: "this is foo", bar: "this is bar" };
      Object.defineProperty(src, "foo", { enumerable: false });
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest: ', dest);
      if (!(typeof dest === 'object')
        || dest.foo !== src.foo) {
        return postLoss();
      }
      dest.foo = 'changed';
      console.log('    dest: ', dest);
      if (dest.foo === src.foo) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // array > custom Array
  newTest('custom Array', () => {
    console.log(
      '  class ArrayCustom extends Array {\n' +
      '      custom () {return true;}\n' +
      '    }\n' +
      '    let src = [1, 2, ArrayCustom.from(["I", "am", "foo"])];\n' +
      '    let dest = deepCopy(src, options);'
    );
    try {
      class ArrayCustom extends Array {
        custom () {return true;}
      }
      let src = [1, 2, ArrayCustom.from(["I", "am", "foo"])];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof ArrayCustom)
        || dest[2][0] !== src[2][0]
        || typeof dest[2].custom !== 'function') {
        return postLoss();
      }
      dest[2][0] = "WE";
      console.log('    dest:', dest);
      if (dest[2][0] === src[2][0]) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  // array > custom Object
  newTest('custom Object', () => {
    console.log(
      '  class ObjectCustom extends Object {\n' +
      '    custom () {return true;}\n' +
      '  }\n' +
      '  let obj = new ObjectCustom();\n' +
      '  Object.assign(obj, {foo: "bar"});\n' +
      '  let src = [1, 2, obj];\n' +
      '  console.log(\'    src: \', src);\n' +
      '  let dest = deepCopy(src, options);\n' +
      '  dest[2].foo = "FOO_FOO";'
    );
    try {
      class ObjectCustom extends Object {
        custom () {return true;}
      }
      let obj = new ObjectCustom();
      Object.assign(obj, {foo: "bar"});
      let src = [1, 2, obj];
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest[2] instanceof ObjectCustom)
        || dest[2].foo !== src[2].foo
        || typeof dest[2].custom !== 'function') {
        return postLoss();
      }
      dest[2].foo = "FOO_FOO";
      console.log('    dest:', dest);
      if (dest[2].foo === src[2].foo) {
        return postShallow();
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });

  // circular object
  newTest('circular Object', () => {
    console.log(
      '  const src = { foo: "Foo", bar: {bar: "Bar"}};\n' +
      '  src.bar.baz = src;'
    );
    try {
      const src = { foo: "Foo", bar: {bar: "Bar"}};
      src.bar.baz = src;
      console.log('    src: ', src);
      let dest = deepCopy(src, options);
      console.log('    dest:', dest);
      if (!(dest instanceof Object)
        || dest.foo !== src.foo) {
        return postLoss();
      }
      console.log('\n  dest.foo = "FOO_FOO";');
      dest.foo = "FOO_FOO";
      console.log('    src: ', src);
      console.log('    dest:', dest);
      if (dest.foo === src.foo) {
        return postShallow();
      }
      // check for not circular
      if (dest.bar.baz !== dest) {
        throw 'circular reference is not circular';
      }
      postOK();
    }  catch (err) { logErr(err, iTest, name); }  });


  //
  // benchmark test
  //

  if (doBenchmark) {

    console.log('\nBenchmark speed test:');
    const BENCHMARK_RUNS = 1000;
    const json = fs.readFileSync('./test/benchmark-fixture.json').toString();
    if (json && json.length) {
      const testSuite = JSON.parse(json);
      const starttime = new Date().getTime();
      for (let i = 0; i < BENCHMARK_RUNS; i++) {
        const dest = deepCopy(testSuite, options);
      }
      const millisecs = new Date().getTime() -  starttime;
      console.log(`Completed ${BENCHMARK_RUNS} passes in ${millisecs} ` +
        `milliseconds.`)
      if (millisecs) {
        console.log(`Performance: ` +
          Math.round(BENCHMARK_RUNS/millisecs*1000)
            .toLocaleString() + ` runs/sec.`)
      }
    } else {
      console.log("Error getting JSON data to test.");
    }

  }

  console.log('\n');
  console.table(status);

  console.log('\nerrors:',errors);


  console.log('All tests complete.\n');
  const endtime = (new Date()).getTime();
  console.log(`\nElapsed time: ${endtime - starttime} milliseconds`);

  return errors;

}



module.exports = testSuite;

