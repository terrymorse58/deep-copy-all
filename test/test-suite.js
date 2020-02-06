// test suite for deep copy
const fs = require('fs');

function testSuite (deepCopy, options) {

  let errors = [];

  const starttime = (new Date()).getTime();

  console.log(`Options are set to:`, options);

  console.log('\nTest 1:');
  console.log(
    '  let src = [1,2,3,[[[[[4,5]]]]]];\n' +
    `  let dest = deepCopy(src, ${options});\n` +
    '  dest[2] = 30000;'
  );
  let src1 = [1, 2, 3, [[[[[4, 5]]]]]];
  let dest1 = deepCopy(src1, options);
  dest1[2] = 30000;
  console.log(
    '    src: ', JSON.stringify(src1, null), '\n' +
    '    dest:', JSON.stringify(dest1, null)
  );

  console.log('\nTest 2:');
  console.log(
    '  let src2 = ["a", 42, {name: "terry", age: "old", hobbies: ["sleeping",' +
    ' "eating"]}];\n' +
    `  let dest2 = deepCopy(src2, ${options});\n` +
    '  dest2[2].age = "secret";\n' +
    '  dest2[2].hobbies[0] = "cycling";'
  );
  let src2 = ["a", 42, {
    name: "terry",
    age: "old",
    hobbies: ["sleeping", "eating"]
  }];
  let dest2 = deepCopy(src2, options);
  dest2[2].age = "secret";
  dest2[2].hobbies[0] = "cycling";
  console.log(
    '    src2: ', JSON.stringify(src2), '\n' +
    '    dest2:', JSON.stringify(dest2), '\n'
  );

  console.log('\nTest3:');
  console.log(
    '  let myMap = new Map();\n' +
    '  let keyString = "a string";\n' +
    '  let keyObj = {};\n' +
    '  let keyFunc = function () {};\n' +
    '  myMap.set(keyString, \'value associated with "a string"\');\n' +
    '  myMap.set(keyObj, \'value associated with keyObj\');\n' +
    '  myMap.set(keyFunc, \'value associated with keyFunc\');\n' +
    `  let dest3 = deepCopy(myMap, ${options});\n` +
    '  dest3.delete(keyFunc);'
  );
  let myMap = new Map();
  let keyString = "a string";
  let keyObj = {};
  let keyFunc = function () {};
  myMap.set(keyString, 'value associated with "a string"');
  myMap.set(keyObj, 'value associated with keyObj');
  myMap.set(keyFunc, 'value associated with keyFunc');
  try {
    let dest3 = deepCopy(myMap, options);
    if (!(dest3 instanceof Map)) {
      throw "Error: failed to preserve Map";
    }
    dest3.delete(keyFunc);
    console.log(
      '    myMap:', myMap, '\n' +
      '    dest3:', dest3
    );
  } catch (err) {
    console.log('*** TEST3 FAILED:',err);
    errors.push("Test3 " + err.toString());
  }

// nested array and Map
  console.log('\nTest4:');
  console.log(
    '  let src4 = {nums: [1,5,[22,[[44]]]], map: myMap};\n' +
    `  let dest4 = deepCopy(src4, ${{options}});\n` +
    '  dest4.nums[2][0] = 220000;'
  );
  let src4 = { nums: [1, 5, [22, [[44]]]], map: myMap };
  try {
    let dest4 = deepCopy(src4, options);
    dest4.nums[2][0] = 220000;
    console.log(
      '    src4:', src4, '\n' +
      '    dest4:', dest4
    );
    if (!(dest4.map instanceof Map)) {
      throw "Error: failed to preserve Map";
    }
  } catch (err) {
    console.log('*** TEST4 FAILED:',err);
    errors.push("Test4 " + err.toString());
  }

// array containing Date
  console.log('\nTest5:');
  console.log(
    '  let src5 = [1, 2, new Date(), 3];\n' +
    `  let dest5 = deepCopy(src5, ${options});\n` +
    '  dest5[2].setMonth(7);'
  );
  let src5 = [1, 2, new Date(), 3];
  try {
    let dest5 = deepCopy(src5, options);
    if (!(dest5[2] instanceof Date)) {
      throw "Error: failed to preserve Date";
    }
    dest5[2].setMonth(7);
    console.log(
      '    src5: ', src5, '\n' +
      '    dest5:', dest5
    );
  } catch (err) {
    console.log('*** TEST FAILED error:',err);
    errors.push("Test5 " + err.toString());
  }

// Set
  console.log('\nTest6:');
  console.log(
    '  let src6 = new Set([1,"a",2,{foo: "bar"}]);\n' +
    `  let dest6 = deepCopy(src6, ${options});\n` +
    '  dest6.add("new stuff");'
  );
  let src6 = new Set([1, "a", 2, { foo: "bar" }]);
  try {
    let dest6 = deepCopy(src6, options);
    if (!(dest6 instanceof Set)) {
      throw "Error: failed to preserve Set";
    }
    dest6.add("new stuff");
    console.log(
      '    src6: ', src6, '\n' +
      '    dest6:', dest6
    );
  }  catch (err) {
    console.log('*** TEST FAILED error:',err);
    errors.push("Test6: " + err.toString());
  }

  console.log('\nTest7:');
  console.log(
    '  let src7 = new Date();\n' +
    `  let dest7 = deepCopy(src7, ${options});\n` +
    '  dest7.setMonth(7);'
  );
  let src7 = new Date();
  try {
    let dest7 = deepCopy(src7, options);
    if (!(dest7 instanceof Date)) {
      throw "Error: failed to preserve Date";
    }
    dest7.setMonth(7);
    console.log(
      '    src7: ', src7, '\n' +
      '    dest7:', dest7
    );
  }  catch (err) {
    console.log('*** TEST FAILED error:',err);
    errors.push("Test7: " + err.toString());
  }

  console.log('\nTest8:');
  console.log(
    '  let src8 = ["maptest", new Map()];\n' +
    '  src8[1].set("fooFn", function foo() {console.log("this is foo")});\n' +
    `  let dest8 = deepCopy(src8, ${options});\n` +
    '  dest8[1].set("barStr", "this is bar");'
  );
  let src8 = ["maptest", new Map()];
  src8[1].set("fooFn", function foo () {console.log("this is foo")});
  try {
    let dest8 = deepCopy(src8, options);
    if (!(dest8[1] instanceof Map)) {
      throw "Error: failed to preserve Map";
    }
    dest8[1].set("barStr", "this is bar");
    console.log(
      '    src8: ', src8, '\n' +
      '    dest8:', dest8
    );
    let fooFn = src8[1].get("fooFn");
    fooFn();
  }  catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test8 " + err.toString());
  }

// non-enumerables
  console.log('\nTest9:');
  console.log(
    '  let src9 = {foo: "this is foo", bar: "this is bar"};\n' +
    '  Object.defineProperty(src9, "foo", {enumerable: false});\n' +
    `  let dest9 = deepCopy(src9, ${options});`
  );
  let src9 = { foo: "this is foo", bar: "this is bar" };
  Object.defineProperty(src9, "foo", { enumerable: false });
  try {
    let dest9 = deepCopy(src9, options);
    console.log(
      '    src9: ', src9, '\n' +
      '    dest9:', dest9
    );
    let d9 = Object.getOwnPropertyDescriptor(dest9, "foo");
    console.log('    dest9.foo descriptor:', d9);
    if (!dest9.foo) {
      throw "Error: failed to copy non-enumerable";
    }
  }  catch (err) {
    console.log('*** TEST FAILED error:',err);
    errors.push("Test9 " + err.toString());
  }

// RegExp
  console.log('\nTest10: (RegExp)');
  console.log(
    '  let src10 = [1,2,/abc/,"foo"];\n' +
    `  let dest10 = deepCopy(src10, ${options});\n` +
    `  dest10[3] = "BAR";`
  );
  let src10 = [1, 2, /abc/, "foo"];
  try {
    let dest10 = deepCopy(src10, options);
    dest10[3] = "BAR";
    console.log(
      '    src10: ', src10, '\n' +
      '    dest10:', dest10
    );
    if (!(dest10[2] instanceof RegExp)) {
      throw "Error: failed to preserve RegExp";
    }
  }  catch (err) {
    console.log('*** TEST FAILED error:',err);
    errors.push("Test10 " + err.toString());
  }

// Int8Array
  console.log('\nTest11:');
  console.log(
    '  let src11 = [ 1, 2, Int8Array.from([3, 4, 42]) ];\n' +
    `  let dest11 = deepCopy(src11, ${options});\n` +
    `  dest11[1] = 200000;`
  );
  let src11 = [1, 2, Int8Array.from([3, 4, 42])];
  try {
    let dest11 = deepCopy(src11, options);
    dest11[1] = 200000;
    console.log(
      '    src11: ', src11, '\n' +
      '    dest11:', dest11
    );
    if (!(dest11[2] instanceof Int8Array)) {
      throw "Error: failed to preserve Int8Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test11 " + err.toString());
  }

// Uint8Array
  console.log('\nTest12:');
  console.log(
    '  let src12 = [ 1, 2, Uint8Array.from([3, 4, 42]) ];\n' +
    `  let dest12 = deepCopy(src12, ${options});\n` +
    `  dest12[1] = 200000;`
  );
  let src12 = [1, 2, Uint8Array.from([3, 4, 42])];
  try {
    let dest12 = deepCopy(src12, options);
    dest12[1] = 200000;
    console.log(
      '    src12: ', src12, '\n' +
      '    dest12:', dest12
    );
    if (!(dest12[2] instanceof Uint8Array)) {
      throw "Error: failed to preserve Uint8Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED error:',err);
    errors.push("Test12 " + err.toString());
  }

// Uint8ClampedArray
  console.log('\nTest13:');
  console.log(
    '  let src13 = [ 1, 2, Uint8ClampedArray.from([3, 4, 42]) ];\n' +
    `  let dest13 = deepCopy(src13, ${options});\n` +
    `  dest13[1] = 42424242;`
  );
  let src13 = [1, 2, Uint8ClampedArray.from([3, 4, 42])];
  try {
    let dest13 = deepCopy(src13, options);
    dest13[1] = 42424242;
    console.log(
      '    src13: ', src13, '\n' +
      '    dest13:', dest13
    );
    if (!(dest13[2] instanceof Uint8ClampedArray)) {
      throw "Error: failed to preserve Uint8ClampedArray";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test13 " + err.toString());
  }

// Int16Array
  console.log('\nTest14:');
  console.log(
    '  let src14 = [ 1, 2, Int16Array.from([3, 4, 42]) ];\n' +
    `  let dest14 = deepCopy(src14, ${options});\n` +
    `  dest14[1] = 16181618;`
  );
  let src14 = [1, 2, Int16Array.from([3, 4, 42])];
  try {
    let dest14 = deepCopy(src14, options);
    dest14[1] = 16181618;
    console.log(
      '    src14: ', src14, '\n' +
      '    dest14:', dest14
    );
    if (!(dest14[2] instanceof Int16Array)) {
      throw "Error failed to preserve Int16Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test14 " + err.toString());
  }

// Uint16Array
  console.log('\nTest15:');
  console.log(
    '  let src15 = [ 1, 2, Uint16Array.from([3, 4, 42]) ];\n' +
    `  let dest15 = deepCopy(src15, ${options});\n` +
    `  dest15[1] = 16181618;`
  );
  let src15 = [1, 2, Uint16Array.from([3, 4, 42])];
  try {
    let dest15 = deepCopy(src15, options);
    dest15[1] = 16181618;
    console.log(
      '    src15: ', src15, '\n' +
      '    dest15:', dest15
    );
    if (!(dest15[2] instanceof Uint16Array)) {
      throw "Error: failed to preserve Uint16Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test15 " + err.toString());
  }

// Int32Array
  console.log('\nTest16:');
  console.log(
    '  let src16 = [ 1, 2, Int32Array.from([3, 4, 42]) ];\n' +
    `  let dest16 = deepCopy(src16, ${options});\n` +
    `  dest16[1] = 16181618;`
  );
  let src16 = [1, 2, Int32Array.from([3, 4, 42])];
  try {
    let dest16 = deepCopy(src16, options);
    dest16[1] = 16181618;
    console.log(
      '    src16: ', src16, '\n' +
      '    dest16:', dest16
    );
    if (!(dest16[2] instanceof Int32Array)) {
      throw "Error: failed to preserve Int32Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test16 " + err.toString());
  }

// Uint32Array
  console.log('\nTest17:');
  console.log(
    '  let src17 = [ 1, 2, Uint32Array.from([3, 4, 42]) ];\n' +
    `  let dest17 = deepCopy(src17, ${options});\n` +
    `  dest17[1] = 16181618;`
  );
  let src17 = [1, 2, Uint32Array.from([3, 4, 42])];
  try {
    let dest17 = deepCopy(src17, options);
    dest17[1] = 16181618;
    console.log(
      '    src17: ', src17, '\n' +
      '    dest17:', dest17
    );
    if (!(dest17[2] instanceof Uint32Array)) {
      throw "Error: failed to preserve Uint32Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test17 " + err.toString());
  }

// Float32Array
  console.log('\nTest18:');
  console.log(
    '  let src18 = [ 1, 2, Float32Array.from([3, 4, 42]) ];\n' +
    `  let dest18 = deepCopy(src18, ${options});\n` +
    `  dest18[1] = 16181618;`
  );
  let src18 = [1, 2, Float32Array.from([3, 4, 42])];
  try {
    let dest18 = deepCopy(src18, options);
    dest18[1] = 16181618;
    console.log(
      '    src18: ', src18, '\n' +
      '    dest18:', dest18
    );
    if (!(dest18[2] instanceof Float32Array)) {
      throw "Error failed to preserve Float32Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test18 " + err.toString());
  }

// Float64Array
  console.log('\nTest19:');
  console.log(
    '  let src19 = [ 1, 2, Float64Array.from([3, 4, 42]) ];\n' +
    `  let dest19 = deepCopy(src19, ${options});\n` +
    `  dest19[1] = 16181618;`
  );
  let src19 = [1, 2, Float64Array.from([3, 4, 42])];
  try {
    let dest19 = deepCopy(src19, options);
    dest19[1] = 16181618;
    console.log(
      '    src19: ', src19, '\n' +
      '    dest19:', dest19
    );
    if (!(dest19[2] instanceof Float64Array)) {
      throw "Error: failed to preserve Float64Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test19 " + err.toString());
  }

// BigInt64Array
  console.log('\nTest20:');
  console.log(
    '  let src20 = [ 1, 2, BigInt64Array.from([3n, 4n, 42n]) ];\n' +
    `  let dest20 = deepCopy(src20, ${options});\n` +
    `  dest20[1] = 16181618;`
  );
  let src20 = [1, 2, BigInt64Array.from([3n, 4n, 42n])];
  try {
    let dest20 = deepCopy(src20, options);
    dest20[1] = 16181618;
    console.log(
      '    src20: ', src20, '\n' +
      '    dest20:', dest20
    );
    if (!(dest20[2] instanceof BigInt64Array)) {
      throw "Error: failed to preserve BigInt64Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test20 " + err.toString());
  }

// BigUint64Array
  let testId = 21;
  console.log('\nTest21:');
  console.log(
    '  let src21 = [ 1, 2, BigUint64Array.from([3n, 4n, 42n]) ];\n' +
    `  let dest21 = deepCopy(src21, ${options});\n` +
    `  dest21[1] = 16181618;`
  );
  let src21 = [1, 2, BigUint64Array.from([3n, 4n, 42n])];
  try {
    let dest21 = deepCopy(src21, options);
    dest21[1] = 16181618;
    console.log(
      '    src21: ', src21, '\n' +
      '    dest21:', dest21
    );
    if (!(dest21[2] instanceof BigUint64Array)) {
      throw "Error: failed to preserve BigUint64Array";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test21 " + err.toString());
  }

  // WeakMap
  console.log(`\nTest22:`);
  console.log(
    '  let wm = new WeakMap();\n' +
    '  let obj = { foo: "I am foo" };\n' +
    '  wm.set(obj, 42);\n' +
    `  let dest22 = deepCopy(src22, ${{options}});\n` +
    `  dest21[1] = 3.1416;`
  );
  let wm = new WeakMap();
  let obj = { foo: "I am foo" };
  wm.set(obj, 42);
  let src22 = [1, 2, wm, "bar"];
  try {
    let dest22 = deepCopy(src22, options);
    dest22[1] = 3.1416;
    console.log(
      '    src22: ', src22, '\n' +
      '    dest22:', dest22
    );
    let destMap = dest22[2];
    if (!(destMap instanceof WeakMap)) {
      throw "Error: failed to preserve WeakMap";
    }
    if (!(destMap.has(obj))) {
      throw "Error: faile to preserve WeakMap content";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test22 " + err.toString());
  }

  // WeakSet
  console.log(`\nTest23:`);
  console.log(
    '  let ws = new WeakSet();\n' +
    '  let obj23 = {value: "in the set"}\n' +
    '  ws.add(obj23);\n' +
    '  let src23 = [1, 2, ws, "bar"];\n' +
    `  let dest23 = deepCopy(src23, ${options});\n` +
    `  dest23[1] = 3.1416;`
  );
  let ws = new WeakSet();
  let obj23 = {value: "in the set"}
  ws.add(obj23);
  let src23 = [1, 2, ws, "bar"];
  try {
    let dest23 = deepCopy(src23, options);
    dest23[1] = 3.1416;
    console.log(
      '    src23: ', src23, '\n' +
      '    dest23:', dest23
    );
    let destSet = dest23[2];
    if (!(destSet instanceof WeakSet)) {
      throw "Error: failed to preserve WeakSet";
    }
    if (!destSet.has(obj23)) {
      throw "Error: failed to preserve WeakSet content";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test23 " + err.toString());
  }

  // ArrayCustom
  console.log(`\nTest24:`);
  console.log(
    '  class ArrayCustom extends Object {\n' +
    '    custom () {return true;}\n' +
    '  }\n' +
    '  let src24 = [1, 2, ArrayCustom.from(["I", "am", "foo"])];\n' +
    `  let dest24 = deepCopy(src24, ${options});\n` +
    `  dest24[1] = 2.00001;`
  );
  class ArrayCustom extends Array {
    custom () {return true;}
  }
  let src24 = [1, 2, ArrayCustom.from(["I", "am", "foo"])];
  try {
    let dest24 = deepCopy(src24, options);
    dest24[1] = 2.00001;
    console.log(
      '    src24: ', src24, '\n' +
      '    dest24:', dest24
    );
    let destCustom = dest24[2];
    if (!(destCustom instanceof ArrayCustom)) {
      throw "Error: failed to preserve ArrayCustom";
    }
    if (typeof destCustom.custom !== 'function') {
      throw "Error: failed to preserve ArrayCustom method 'custom'";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test24 " + err.toString());
  }

  // ArrayBuffer
  console.log(`\nTest25 (ArrayBuffer):`);
  console.log(
    '  let aBuf = new ArrayBuffer(8);\n' +
    '  let src25 = new Uint8Array(aBuf);\n' +
    '  src25.set([1, 2, 3], 3);\n' +
    `  let bufCopy = deepCopy(aBuf, ${options});\n` +
    `  let dest25 = new Uint8Array(bufCopy);\n` +
    `  dest25[0] = 128;`
  );
  let aBuf = new ArrayBuffer(8);
  let src25 = new Uint8Array(aBuf);
  src25.set([1, 2, 3], 3);
  try {
    let bufCopy = deepCopy(aBuf, options);
    if (!(bufCopy instanceof ArrayBuffer)) {
      throw "Error: failed to preserve ArrayBuffer";
    }
    if (bufCopy.length !== aBuf.length) {
      throw "Erryr: failed to preserve ArrrayBuffer length";
    }
    let dest25 = new Uint8Array(bufCopy);
    dest25[0] = 128;
    console.log(
      '    aBuf: ', aBuf, '\n' +
      '    bufCopy:', bufCopy
    );
    if (dest25[3] !== src25[3]) {
      throw "Error: failed to duplicate ArrayBuffer content";
    }
    if (dest25[0] === src25[0]) {
      throw "Error: failed to make copy of ArrayBuffer";
    }
  } catch (err) {
    console.log('*** TEST FAILED:',err);
    errors.push("Test25 " + err.toString());
  }

  console.log('\nerrors:',errors);

  //
  // benchmark test
  //

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

  console.log('All tests complete.\n');
  const endtime = (new Date()).getTime();
  console.log(`\nElapsed time: ${endtime - starttime} milliseconds`);

  return errors;

}



module.exports = testSuite;

