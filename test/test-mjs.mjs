import deepCopy from '../index.mjs';

console.log('\ndeepCopy tests...');

const starttime = (new Date()).getTime();

// DEEP
const DEEP = true;
console.log(`DEEP is set to ${DEEP}`);

console.log('\nTest 1:');
console.log(
  '  let src = [1,2,3,[[[[[4,5]]]]]];\n' +
  `  let dest = deepCopy(src, ${DEEP});\n` +
  '  dest[2] = 30000;'
);
let src1 = [1,2,3,[[[[[4,5]]]]]];
let dest1 = deepCopy(src1,DEEP);
dest1[2] = 30000;
console.log(
  '    src: ',JSON.stringify(src1,null), '\n' +
  '    dest:',JSON.stringify(dest1,null)
);

console.log('\nTest 2:');
console.log(
  '  let src2 = ["a", 42, {name: "terry", age: "old", hobbies: ["sleeping",' +
  ' "eating"]}];\n' +
  `  let dest2 = deepCopy(src2, ${DEEP});\n` +
  '  dest2[2].age = "secret";\n' +
  '  dest2[2].hobbies[0] = "cycling";'
);
let src2 = ["a", 42, {name: "terry", age: "old", hobbies: ["sleeping", "eating"]}];
let dest2 = deepCopy(src2,DEEP);
dest2[2].age = "secret";
dest2[2].hobbies[0] = "cycling";
console.log(
  '    src2: ',JSON.stringify(src2), '\n' +
  '    dest2:',JSON.stringify(dest2), '\n'
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

console.log('\nTest4:');
console.log(
  '  let src4 = {nums: [1,5,[22,[[44]]]], map: myMap};\n' +
  `  let dest4 = deepCopy(src4, ${DEEP});\n` +
  '  dest4.nums[2][0] = 220000;\n'
);
let src4 = {nums: [1,5,[22,[[44]]]], map: myMap};
let dest4 = deepCopy(src4, DEEP);
dest4.nums[2][0] = 220000;
console.log(
  '    src4:',src4, '\n' +
  '    dest4:', dest4
);

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
  '    src5: ',src5, '\n' +
  '    dest5:', dest5
);

console.log('\nTest6:');
console.log(
  '  let src6 = new Set([1,"a",2,{foo: "bar"}]);\n' +
  `  let dest6 = deepCopy(src6, ${DEEP});\n` +
  '  dest6.add("new stuff");'
);
let src6 = new Set([1,"a",2,{foo: "bar"}]);
let dest6 = deepCopy(src6, DEEP);
dest6.add("new stuff");
console.log(
  '    src6: ',src6, '\n' +
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
  '    src7: ',src7, '\n' +
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
src8[1].set("fooFn", function foo() {console.log("this is foo")});
let dest8 = deepCopy(src8, DEEP);
dest8[1].set("barStr", "this is bar");
console.log(
  '    src8: ',src8, '\n' +
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
let src9 = {foo: "this is foo", bar: "this is bar"};
Object.defineProperty(src9, "foo", {enumerable: false});
let dest9 = deepCopy(src9, DEEP);
console.log(
  '    src9: ',src9, '\n' +
  '    dest9:', dest9
);
let d9 = Object.getOwnPropertyDescriptor(dest9,"foo");
console.log('dest9.foo descriptor:',d9);


console.error('deepCopy tests complete.\n');
const endtime = (new Date()).getTime();
console.log(`\nElapsed time: ${endtime-starttime} milliseconds`);




