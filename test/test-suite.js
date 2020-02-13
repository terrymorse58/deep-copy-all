// test suite for deep copy
const fs = require('fs');

const doBenchmark = false;

function testSuite (deepCopy, options) {

  let errors = [];
  let iTest = 0;
  let name = '';

  function logErr (err, iTest, name) {
    console.log(`*** TEST${iTest} (${name}) FAILED:`, err);
    errors.push(`Test${iTest} (${name}) `+ err.toString());
  }

  const starttime = (new Date()).getTime();

  console.log(`Options are set to:`, options);

  // array > array
  iTest++;
  name = 'array > array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [1,2,3,[[[[[4,5]]]]]];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    '  dest[2] = 30000;'
  );
  try {
    let src = [1, 2, 3, [[[[[4, 5]]]]]];
    console.log('    src: ', JSON.stringify(src));
    let dest = deepCopy(src, options);
    dest[2] = 30000;
    console.log('    dest:', JSON.stringify(dest));
    if (dest[2] === src[2]) {
      throw 'Error copy is shallow';
    }
  } catch (err) { logErr(err, iTest, name); }

  // array > object > array
  iTest++;
  name = 'array > object > array'
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = ["a", 42, {name: "terry", age: "old", hobbies: ["sleeping",' +
    ' "eating"]}];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    '  dest[2].age = "secret";\n' +
    '  dest[2].hobbies[0] = "cycling";'
  );
  try {
    const src = ["a", 42, {
      name: "terry",
      age: "old",
      hobbies: ["sleeping", "eating"]
    }];
    console.log('    src: ', JSON.stringify(src));
    let dest = deepCopy(src, options);
    dest[2].age = "secret";
    dest[2].hobbies[0] = "cycling";
    console.log('    dest:', JSON.stringify(dest));
    if (dest[2].age === src[2].age) {
      throw 'Error copy is shallow';
    }
  }  catch (err) { logErr(err, iTest, name); }


  // Map
  iTest++;
  name = 'Map';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest instanceof Map)) {
      throw "Error: failed to create Map";
    }
    dest.delete(keyFunc);
    if (myMap.get(keyFunc) === undefined) {
      throw 'Error: copy is shallow';
    }
    console.log('    dest: ', dest);
  }  catch (err) { logErr(err, iTest, name); }

// array > Date
  iTest++;
  name = 'array > Date';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof Date)) {
      throw "Error: failed to preserve Date";
    }
    dest[2].setMonth(7);
    console.log('    dest:', dest);
    if (dest[2].getMonth() === src[2].getMonth()) {
      throw 'Error: Date is shallow copy';
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > BigInt
  iTest++;
  name = 'array > BigInt';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (typeof dest[2] !== 'bigint') {
      throw "Error: failed to copy BigInt";
    }
  }  catch (err) { logErr(err, iTest, name); }

// Set
  iTest++;
  name = 'Set';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = new Set([1,"a",2,{foo: "bar"}]);\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    '  dest.add("new stuff");'
  );
  try {
    let src = new Set([1, "a", 2, { foo: "bar" }]);
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest instanceof Set)) {
      throw "Error: copy is not Set";
    }
    dest.add("new stuff");
    console.log('    dest:', dest);
    if (src.has("new stuff")) {
      throw 'Error: Set is shallow copy';
    }
  }  catch (err) { logErr(err, iTest, name); }


// object > non-enumerable
  iTest++;
  name = 'object > non-enumerable';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!dest.foo) {
      throw "Error: failed to copy non-enumerable";
    }
    dest.foo = 'changed';
    console.log('    dest: ', dest);
    if (dest.foo === src.foo) {
      throw 'Error: Object is shallow copy';
    }
  }  catch (err) { logErr(err, iTest, name); }

// RegExp
  iTest++;
  name = 'array > RegExp';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [1, 2, /abc/, "foo"];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[3] = "BAR";`
  );
  try {
    let src = [1, 2, /abc/, "foo"];
    console.log('    src:', src);
    let dest = deepCopy(src, options);
    console.log('    dest: ', dest);
    if (!(dest[2] instanceof RegExp)) {
      throw 'Error: copied /abc/ not RegExp';
    }
    dest[3] = "BAR";
    console.log('    dest: ', dest);
    if (dest[3] === src[3]) {
      throw "Error: copy shallow";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Int8Array
  iTest++;
  name = 'array > Int8Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Int8Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 200000;`
  );
  try {
    let src = [1, 2, Int8Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Int8Array)) {
      throw "Error: failed to preserve Int8Array";
    }
    dest[1] = 200000;
    console.log('    dest:', dest);
    if (dest[1] === src[1]) {
      throw 'Error: Int8Array shallow copy';
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Uint8Array
  iTest++;
  name = 'array > Uint8Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Uint8Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 200000;`
  );
  try {
    let src = [1, 2, Uint8Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Uint8Array)) {
      throw "Error: Uint8Array not copied";
    }
    dest[1] = 200000;
    console.log('    dest:', dest);
    if (dest[1] === src[1]) {
      throw "Error: Uint8Array shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Uint8ClampedArray
  iTest++;
  name = 'array > Uint8ClampedArray';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Uint8ClampedArray.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 42424242;`
  );
  try {
    let src = [1, 2, Uint8ClampedArray.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Uint8ClampedArray)) {
      throw "Error: copy not Uint8ClampedArray";
    }
    dest[1] = 42424242;
    console.log('    dest:', dest);
    if (dest[1] === src[1]) {
      throw "Error: Uint8ClampedArray shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Int16Array
  iTest++;
  name = 'array > Int16Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Int16Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 16181618;`
  );
  try {
    let src = [1, 2, Int16Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Int16Array)) {
      throw "Error Int16Array not copied";
    }
    dest[1] = 16181618;
    console.log('    dest:', dest);
    if (dest[1] === src[1] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Uint16Array
  iTest++;
  name = 'array > Uint16Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Uint16Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 16181618;`
  );
  try {
    let src = [1, 2, Uint16Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Uint16Array)) {
      throw "Error: Uint16Array not copied";
    }
    dest[1] = 16181618;
    console.log('    dest:', dest);
    if (dest[1] === src[1] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array Int32Array
  iTest++;
  name = 'array > Int32Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Int32Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 16181618;`
  );
  try {
    let src = [1, 2, Int32Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Int32Array)) {
      throw "Error: failed to preserve Int32Array";
    }
    dest[1] = 16181618;
    console.log('    dest:', dest);
    if (dest[1] === src[1] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// Uint32Array
  iTest++;
  name = 'array > Uint32Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Uint32Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 16181618;`
  );
  try {
    let src = [1, 2, Uint32Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Uint32Array)) {
      throw "Error: Uint32Array not copied";
    }
    dest[1] = 16181618;
    console.log('    dest:', dest);
    if (dest[1] === src[1] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Float32Array
  iTest++;
  name = 'array > Float32Array';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof Float32Array)) {
      throw "Error Float32Array not copied";
    }
    dest[1] = 16181618;
    console.log('    dest:', dest);
    if (dest[1] === src[1] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > Float64Array
  iTest++;
  name = 'array > Float64Array';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let src = [ 1, 2, Float64Array.from([3, 4, 42]) ];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    `  dest[1] = 16181618;`
  );
  try {
    let src = [1, 2, Float64Array.from([3, 4, 42])];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    if (!(dest[2] instanceof Float64Array)) {
      throw "Error: Float64Array not copied";
    }
    dest[1] = 16181618;
    console.log('    dest:', dest);
    if (dest[1] === src[1] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > BigInt64Array
  iTest++;
  name = 'array > BigInt64Array';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof BigInt64Array)) {
      throw "Error: BigInt64Array not copied";
    }
    dest[2][0] = 300000n;
    console.log('    dest:', dest);
    if (dest[2][0] === src[2][0] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

// array > BigUint64Array
  iTest++;
  name = 'array > BigUint64Array';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof BigUint64Array)) {
      throw "Error: failed to preserve BigUint64Array";
    }
    dest[2][0] = 909090909n;
    console.log('    dest:', dest);
    if (dest[2][0] === src[2][0] ) {
      throw "Error shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

  // array > WeakMap
  iTest++;
  name = 'array > WeakMap';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof WeakMap)) {
      throw "Error: WeakMap not copied";
    }
    dest[1] = 3.1416;
    console.log('    dest:', dest);
    let destMap = dest[2];
    if (!(destMap.has(obj))) {
      throw "Error: failed to preserve WeakMap content";
    }
  }  catch (err) { logErr(err, iTest, name); }

  // array > WeakSet
  iTest++;
  name = 'array > WeakSet';
  console.log(`\nTest${iTest} (${name}):`);
  console.log(
    '  let ws = new WeakSet();\n' +
    '    let obj = {value: "in the set"}\n' +
    '    ws.add(obj);\n' +
    '    let src = [1, 2, ws, "bar"];\n' +
    '    let dest = deepCopy(src, options)'
  );
  try {
    let ws = new WeakSet();
    let obj = {value: "in the set"}
    ws.add(obj);
    let src = [1, 2, ws, "bar"];
    console.log('    src: ', src);
    let dest = deepCopy(src, options);
    console.log('    dest:', dest);
    let destSet = dest[2];
    if (!(destSet instanceof WeakSet)) {
      throw "Error: failed to preserve WeakSet";
    }
    if (!destSet.has(obj)) {
      throw "Error: failed to preserve WeakSet content";
    }
  }  catch (err) { logErr(err, iTest, name); }

  // array > ArrayCustom
  iTest++;
  name = 'array > ArrayCustom';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof ArrayCustom)) {
      throw "Error: failed to preserve ArrayCustom";
    }
    if (typeof dest[2].custom !== 'function') {
      throw "Error: did not copy ArrayCustom method 'custom'";
    }
    dest[2][0] = "WE";
    console.log('    dest:', dest);
    if (dest[2][0] === src[2][0]) {
      throw 'Error: shallow copy';
    }
  }  catch (err) { logErr(err, iTest, name); }

  // array > ObjectCustom
  iTest++;
  name = 'array > ObjectCustom';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest[2] instanceof ObjectCustom)) {
      throw 'Error ObjectCustom not copied';
    }
    if (typeof dest[2].custom !== 'function') {
      throw "Error: did not copy ObjectCustom method 'custom'";
    }
    dest[2].foo = "FOO_FOO";
    console.log('    dest:', dest);
    if (dest[2].foo === src[2].foo) {
      throw 'Error: shallow copy';
    }
  }  catch (err) { logErr(err, iTest, name); }

  // ArrayBuffer
  iTest++;
  name = 'array > ArrayBuffer';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(bufCopy instanceof ArrayBuffer)) {
      throw "Error: ArrayBuffer not copied";
    }
    if (bufCopy.length !== aBuf.length) {
      throw "Error: failed to preserve ArrrayBuffer length";
    }
    let dest = new Uint8Array(bufCopy);
    dest[0] = 128;
    if (dest[3] !== src[3]) {
      throw "Error: failed to duplicate ArrayBuffer content";
    }
    if (dest[0] === src[0]) {
      throw "Error: failed to make copy of ArrayBuffer";
    }
  }  catch (err) { logErr(err, iTest, name); }

  // node.js Buffer
  iTest++;
  name = 'node.js Buffer';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest instanceof Buffer)) {
      throw "Error: failed to preserve Buffer";
    }
    if (dest.length !== src.length) {
      throw "Error: failed to preserve Buffer length";
    }
    dest[0] = 128;
    if (dest[1] !== src[1]) {
      throw "Error: failed to copy Buffer content";
    }
    if (dest[0] === src[0]) {
      throw "Error: Buffer shallow copy";
    }
  }  catch (err) { logErr(err, iTest, name); }

  // Error
  iTest++;
  name = 'Error';
  console.log(`\nTest${iTest} (${name}):`);
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
    if (!(dest instanceof Error)) {
      throw "Error: failed to preserve Error";
    }
    if (dest.message !== src.message) {
      throw "Error: failed to preserve Error message";
    }
    if (dest.stack !== src.stack) {
      throw "Error: failed to preserve Error stack";
    }
  }  catch (err) { logErr(err, iTest, name); }

  console.log('\nerrors:',errors);

  //
  // benchmark test
  //

  if (doBenchmark) {
    console.log('\nBenchmark speed test:');
    const BENCHMARK_RUNS = 1000;
    const json = fs.readFileSync('./test/benchmark-fixture.json');
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

  console.log('All tests complete.\n');
  const endtime = (new Date()).getTime();
  console.log(`\nElapsed time: ${endtime - starttime} milliseconds`);

  return errors;

}



module.exports = testSuite;

