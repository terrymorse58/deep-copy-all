# `deep-copy-all` #

A fast, compact, and robust method to deep copy all JavaScript data types
---
![GitHub top language](https://img.shields.io/github/languages/top/terrymorse58/deep-copy-all)
![GitHub package.json version](https://img.shields.io/github/package-json/v/terrymorse58/deep-copy-all)
[![codebeat badge](https://codebeat.co/badges/8791cc9e-5a88-4a2e-9375-fc4d207e9370)](https://codebeat.co/projects/github-com-terrymorse58-deep-copy-all-master)
![David](https://img.shields.io/david/terrymorse58/deep-copy-all)
![NPM Downloads](https://img.shields.io/npm/dw/deep-copy-all)
![NPM License](https://img.shields.io/npm/l/deep-copy-all)
[![Twitter](https://img.shields.io/twitter/follow/terrymorse.svg?style=social&label=@terrymorse)](https://twitter.com/terrymorse)

**deep-copy-all** JavaScript object deep cloner is:

- fast – ranking highly on common benchmark speed tests

- compact – about 5k (minified)

- robust – correctly handling all
standard JavaScript data types, as well as custom types

## Install ##
```shell script
$ npm install deep-copy-all
```

## Usage ##
Node.js
````javascript
const deepCopy = require('deep-copy-all');
/* ... */
copy = deepCopy(source);
````
HTML file:
```html
<script src="dist/deepCopyAll.browser.js"></script>
<script>
  /* ... */
  let copy = deepCopy(source);
</script>
```
---
## Comparison
The accuracy of **deep-copy-all** compares well against other deep copying
 packages.

 Legend: &nbsp; &nbsp; ☑️ - deep copy
 &nbsp; &nbsp; 🚧 - shallow copy
 &nbsp; &nbsp; 🗑️ - data loss
 &nbsp; &nbsp; ⚠️ - Error

 data type         | JSON.* | ce  | d-c | dc  | cl  | f-c | deep-copy-all
 ----------------- | ------ | --- | --- | --- | --- | --- | -------------
 Array             | ☑️        | ☑️           |☑️|☑️|☑️|☑️|☑️
 ArrayBuffer       | 🗑️ | 🗑️    |🗑️|☑️|🗑️|☑️|☑️
 BigInt            | ⚠️     | ☑️           |☑️|☑️|☑️|☑️|☑️
 BigInt64Array     | ⚠️     | 🗑️    |🗑️|🚧|☑️|☑️|☑️
 BigUint64Array    | ⚠️     | 🗑️    |🗑️|🚧|☑️|☑️|☑️
 Buffer            | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Date              | 🗑️ | ☑️           |☑️|☑️|☑️|☑️|☑️
 Error             | 🗑️ | 🗑️    |🗑️|🚧|☑️|🚧|☑️
 Float32Array      | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Float64Array      | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Int8Array         | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Int8Array         | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Int32Array        | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Map               | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Object            | ☑️        | ☑️           |☑️|☑️|☑️|☑️|☑️
 RegExp            | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Set               | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Uint8Array        | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Uint8ClampedArray | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Uint16Array       | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 Uint32Array       | 🗑️ | 🗑️    |🗑️|☑️|☑️|☑️|☑️
 WeakMap           | 🗑️ | 🗑️    |🗑️|🚧|⚠️|🚧|🚧
 WeakSet           | 🗑️ | 🗑️    |🗑️|🚧|⚠️|🚧|🚧
 enumerable:false  | 🗑️ | 🗑️    |🗑️|🗑️|🗑️|🗑️|☑️
 custom Array      | 🗑️ | 🗑️    |🗑️|🗑️|🗑️|☑️|☑️
 custom Object     | 🗑️ | 🗑️    |🗑️|🗑️|☑️|☑️|☑️
 circular Object   | ⚠️ | ☑️  |⚠️|☑️|☑️|🗑️|☑️

JSON.* - JSON.parse(JSON.stringify())<br>
ce - [cloneextend](https://www.npmjs.com/package/cloneextend)<br>
d-c - [deep-copy](https://www.npmjs.com/package/cloneextend)<br>
dc - [deepcopy](https://www.npmjs.com/package/deepcopy)<br>
cl - [clone](https://www.npmjs.com/package/clone)<br>
f-c - [fast-copy](https://www.npmjs.com/package/fast-copy)

---

## `deepCopy()` ##
Perform deep copy of a JavaScript object or array.
#### Syntax ####
````
deepCopy(source [, options])
````
#### Parameters ####
`source`<br>
&nbsp;&nbsp;&nbsp; The item to copy.

`options`<br>
&nbsp;&nbsp;&nbsp; {Object} *[optional]* -  Modifies copying behavior.

`options` properties:

&nbsp;&nbsp;&nbsp; `goDeep`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {Boolean} *[optional]* - Perform deep copy if *true* (default).<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Set to **false** to perform shallow copy.

&nbsp;&nbsp;&nbsp; `includeNonEnumerable`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {Boolean} *[optional]* - Copies non-enumerable properties if *true*.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Skips non-enumerable properties if *false* (default).

&nbsp;&nbsp;&nbsp; `detectCircular`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {Boolean} *[optional]* - Detect circular references if **true** (default).<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; May be set to *false* if source has no circular references.

&nbsp;&nbsp;&nbsp; `maxDepth`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {number} *[optional]* - The maximum depth to copy, default is 20 levels.

#### Return value ####
The copied data.

---

## Performance ##
The following data types — passed directly to deepCopy or embedded within
another object — have been verified to be copied correctly:

- `Array`
- `ArrayBuffer`
- `Buffer` (node.js)
- `Date`
- `Error`
- `RegExp`
- `Int8Array`
- `Uint8Array`
- `Uint8ClampedArray`
- `Int16Array`
- `Uint16Array`
- `Int32Array`
- `Uint32Array`
- `Float32Array`
- `Float64Array`
- `BigInt64Array`
- `BigUint64Array`
- `Map`
- `Set`
- `Object`
- custom Array
- custom Object

Primtive data types are *not* deep copied. Instead, their
values are copied:

- `Number`
- `String`
- `Boolean`
- `undefined`
- `BigInt`
- `Symbol`
- `null`

The following object types are not deep copied, as no way has been found to copy
them. They are copied by reference only:

- `Function`
- `WeakMap`
- `WeakSet`

## Benchmark ##

In a standard
[benchmark test](https://github.com/ahmadnassri/benchmark-node-clone)
of 14 commonly used deep copy modules, **deep-copy-all**
was 4th fastest.

