const deepCopy = require('../index.js');

console.log('\ndeepCopy tests...');

for (let i = 0; i < 10; i++ ) {

  const starttime = (new Date()).getTime();

// DEEP
  const DEEP = false;
  console.log(`DEEP is set to ${DEEP}`);

  console.log('\nTest 1:');
  console.log(
    '  let src = [1,2,3,[[[[[4,5]]]]]];\n' +
    `  let dest = deepCopy(src, ${DEEP});\n` +
    '  dest[2] = 30000;'
  );
  let src1 = [1, 2, 3, [[[[[4, 5]]]]]];
  let dest1 = deepCopy(src1, DEEP);
  dest1[2] = 30000;
  console.log(
    '    src: ', JSON.stringify(src1, null), '\n' +
    '    dest:', JSON.stringify(dest1, null)
  );

  console.log('\nTest 2:');
  console.log(
    '  let src2 = ["a", 42, {name: "terry", age: "old", hobbies: ["sleeping",' +
    ' "eating"]}];\n' +
    `  let dest2 = deepCopy(src2, ${DEEP});\n` +
    '  dest2[2].age = "secret";\n' +
    '  dest2[2].hobbies[0] = "cycling";'
  );
  let src2 = ["a", 42, {
    name: "terry",
    age: "old",
    hobbies: ["sleeping", "eating"]
  }];
  let dest2 = deepCopy(src2, DEEP);
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
    `  let dest3 = deepCopy(myMap, ${DEEP});\n` +
    '  dest3.delete(keyFunc);'
  );
  let myMap = new Map();
  let keyString = "a string";
  let keyObj = {};
  let keyFunc = function () {};
  myMap.set(keyString, 'value associated with "a string"');
  myMap.set(keyObj, 'value associated with keyObj');
  myMap.set(keyFunc, 'value associated with keyFunc');
  let dest3 = deepCopy(myMap, DEEP);
  dest3.delete(keyFunc);
  console.log(
    '    myMap:', myMap, '\n' +
    '    dest3:', dest3
  );

// nested array and Map
  console.log('\nTest4:');
  console.log(
    '  let src4 = {nums: [1,5,[22,[[44]]]], map: myMap};\n' +
    `  let dest4 = deepCopy(src4, ${DEEP});\n` +
    '  dest4.nums[2][0] = 220000;'
  );
  let src4 = { nums: [1, 5, [22, [[44]]]], map: myMap };
  let dest4 = deepCopy(src4, DEEP);
  dest4.nums[2][0] = 220000;
  console.log(
    '    src4:', src4, '\n' +
    '    dest4:', dest4
  );

// array containing Date
  console.log('\nTest5:');
  console.log(
    '  let src5 = [1, 2, new Date(), 3];\n' +
    `  let dest5 = deepCopy(src5, ${DEEP});\n` +
    '  dest5[2].setMonth(7);'
  );
  let src5 = [1, 2, new Date(), 3];
  let dest5 = deepCopy(src5, DEEP);
  dest5[2].setMonth(7);
  console.log(
    '    src5: ', src5, '\n' +
    '    dest5:', dest5
  );

// Set
  console.log('\nTest6:');
  console.log(
    '  let src6 = new Set([1,"a",2,{foo: "bar"}]);\n' +
    `  let dest6 = deepCopy(src6, ${DEEP});\n` +
    '  dest6.add("new stuff");'
  );
  let src6 = new Set([1, "a", 2, { foo: "bar" }]);
  let dest6 = deepCopy(src6, DEEP);
  dest6.add("new stuff");
  console.log(
    '    src6: ', src6, '\n' +
    '    dest6:', dest6
  );

  console.log('\nTest7:');
  console.log(
    '  let src7 = new Date();\n' +
    `  let dest7 = deepCopy(src7, ${DEEP});\n` +
    '  dest7.setMonth(7);'
  );
  let src7 = new Date();
  let dest7 = deepCopy(src7, DEEP);
  dest7.setMonth(7);
  console.log(
    '    src7: ', src7, '\n' +
    '    dest7:', dest7
  );

  console.log('\nTest8:');
  console.log(
    '  let src8 = ["maptest", new Map()];\n' +
    '  src8[1].set("fooFn", function foo() {console.log("this is foo")});\n' +
    `  let dest8 = deepCopy(src8, ${DEEP});\n` +
    '  dest8[1].set("barStr", "this is bar");'
  );
  let src8 = ["maptest", new Map()];
  src8[1].set("fooFn", function foo () {console.log("this is foo")});
  let dest8 = deepCopy(src8, DEEP);
  dest8[1].set("barStr", "this is bar");
  console.log(
    '    src8: ', src8, '\n' +
    '    dest8:', dest8
  );
  let fooFn = src8[1].get("fooFn");
  fooFn();

// non-enumerables
  console.log('\nTest9:');
  console.log(
    '  let src9 = {foo: "this is foo", bar: "this is bar"};\n' +
    '  Object.defineProperty(src9, "foo", {enumerable: false});\n' +
    `  let dest9 = deepCopy(src9, ${DEEP});`
  );
  let src9 = { foo: "this is foo", bar: "this is bar" };
  Object.defineProperty(src9, "foo", { enumerable: false });
  let dest9 = deepCopy(src9, DEEP);
  console.log(
    '    src9: ', src9, '\n' +
    '    dest9:', dest9
  );
  let d9 = Object.getOwnPropertyDescriptor(dest9, "foo");
  console.log('dest9.foo descriptor:', d9);

// RegExp
  console.log('\nTest10:');
  console.log(
    '  let src10 = [1,2,/abc/,"foo"];\n' +
    '  let dest10 = deepCopy(src10, ${DEEP});\n' +
    `  dest10[3] = "BAR";`
  );
  let src10 = [1, 2, /abc/, "foo"];
  let dest10 = deepCopy(src10, DEEP);
  dest10[3] = "BAR";
  console.log(
    '    src10: ', src10, '\n' +
    '    dest10:', dest10
  );

// Int8Array
  console.log('\nTest11:');
  console.log(
    '  let src11 = [ 1, 2, Int8Array.from([3, 4, 42]) ];\n' +
    `  let dest11 = deepCopy(src11, ${DEEP});\n` +
    `  dest11[1] = 200000;`
  );
  let src11 = [1, 2, Int8Array.from([3, 4, 42])];
  let dest11 = deepCopy(src11, DEEP);
  dest11[1] = 200000;
  console.log(
    '    src11: ', src11, '\n' +
    '    dest11:', dest11
  );

// Uint8Array
  console.log('\nTest12:');
  console.log(
    '  let src12 = [ 1, 2, Uint8Array.from([3, 4, 42]) ];\n' +
    `  let dest12 = deepCopy(src12, ${DEEP});\n` +
    `  dest12[1] = 200000;`
  );
  let src12 = [1, 2, Uint8Array.from([3, 4, 42])];
  let dest12 = deepCopy(src12, DEEP);
  dest12[1] = 200000;
  console.log(
    '    src12: ', src12, '\n' +
    '    dest12:', dest12
  );

// Uint8ClampedArray
  console.log('\nTest13:');
  console.log(
    '  let src13 = [ 1, 2, Uint8ClampedArray.from([3, 4, 42]) ];\n' +
    `  let dest13 = deepCopy(src13, ${DEEP});\n` +
    `  dest13[1] = 42424242;`
  );
  let src13 = [1, 2, Uint8ClampedArray.from([3, 4, 42])];
  let dest13 = deepCopy(src13, DEEP);
  dest13[1] = 42424242;
  console.log(
    '    src13: ', src13, '\n' +
    '    dest13:', dest13
  );

// Int16Array
  console.log('\nTest14:');
  console.log(
    '  let src14 = [ 1, 2, Int16Array.from([3, 4, 42]) ];\n' +
    `  let dest14 = deepCopy(src14, ${DEEP});\n` +
    `  dest14[1] = 16181618;`
  );
  let src14 = [1, 2, Int16Array.from([3, 4, 42])];
  let dest14 = deepCopy(src14, DEEP);
  dest14[1] = 16181618;
  console.log(
    '    src14: ', src14, '\n' +
    '    dest14:', dest14
  );

// Uint16Array
  console.log('\nTest15:');
  console.log(
    '  let src15 = [ 1, 2, Uint16Array.from([3, 4, 42]) ];\n' +
    `  let dest15 = deepCopy(src15, ${DEEP});\n` +
    `  dest15[1] = 16181618;`
  );
  let src15 = [1, 2, Uint16Array.from([3, 4, 42])];
  let dest15 = deepCopy(src15, DEEP);
  dest15[1] = 16181618;
  console.log(
    '    src15: ', src15, '\n' +
    '    dest15:', dest15
  );

// Int32Array
  console.log('\nTest16:');
  console.log(
    '  let src16 = [ 1, 2, Int32Array.from([3, 4, 42]) ];\n' +
    `  let dest16 = deepCopy(src16, ${DEEP});\n` +
    `  dest16[1] = 16181618;`
  );
  let src16 = [1, 2, Int32Array.from([3, 4, 42])];
  let dest16 = deepCopy(src16, DEEP);
  dest16[1] = 16181618;
  console.log(
    '    src16: ', src16, '\n' +
    '    dest16:', dest16
  );

// Uint32Array
  console.log('\nTest17:');
  console.log(
    '  let src17 = [ 1, 2, Uint32Array.from([3, 4, 42]) ];\n' +
    `  let dest17 = deepCopy(src17, ${DEEP});\n` +
    `  dest17[1] = 16181618;`
  );
  let src17 = [1, 2, Uint32Array.from([3, 4, 42])];
  let dest17 = deepCopy(src17, DEEP);
  dest17[1] = 16181618;
  console.log(
    '    src17: ', src17, '\n' +
    '    dest17:', dest17
  );

// Float32Array
  console.log('\nTest18:');
  console.log(
    '  let src18 = [ 1, 2, Float32Array.from([3, 4, 42]) ];\n' +
    `  let dest18 = deepCopy(src18, ${DEEP});\n` +
    `  dest18[1] = 16181618;`
  );
  let src18 = [1, 2, Float32Array.from([3, 4, 42])];
  let dest18 = deepCopy(src18, DEEP);
  dest18[1] = 16181618;
  console.log(
    '    src18: ', src18, '\n' +
    '    dest18:', dest18
  );

// Float64Array
  console.log('\nTest19:');
  console.log(
    '  let src19 = [ 1, 2, Float64Array.from([3, 4, 42]) ];\n' +
    `  let dest19 = deepCopy(src19, ${DEEP});\n` +
    `  dest19[1] = 16181618;`
  );
  let src19 = [1, 2, Float64Array.from([3, 4, 42])];
  let dest19 = deepCopy(src19, DEEP);
  dest19[1] = 16181618;
  console.log(
    '    src19: ', src19, '\n' +
    '    dest19:', dest19
  );

// BigInt64Array
  console.log('\nTest20:');
  console.log(
    '  let src20 = [ 1, 2, BigInt64Array.from([3n, 4n, 42n]) ];\n' +
    `  let dest20 = deepCopy(src20, ${DEEP});\n` +
    `  dest20[1] = 16181618;`
  );
  let src20 = [1, 2, BigInt64Array.from([3n, 4n, 42n])];
  let dest20 = deepCopy(src20, DEEP);
  dest20[1] = 16181618;
  console.log(
    '    src20: ', src20, '\n' +
    '    dest20:', dest20
  );

// BigUint64Array
  console.log('\nTest21:');
  console.log(
    '  let src21 = [ 1, 2, BigUint64Array.from([3n, 4n, 42n]) ];\n' +
    `  let dest21 = deepCopy(src21, ${DEEP});\n` +
    `  dest21[1] = 16181618;`
  );
  let src21 = [1, 2, BigUint64Array.from([3n, 4n, 42n])];
  let dest21 = deepCopy(src21, DEEP);
  dest21[1] = 16181618;
  console.log(
    '    src21: ', src21, '\n' +
    '    dest21:', dest21
  );

  console.error('deepCopy tests complete.\n');
  const endtime = (new Date()).getTime();
  console.log(`\nElapsed time: ${endtime - starttime} milliseconds`);

}




