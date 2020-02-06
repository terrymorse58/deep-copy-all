# deep-copy-all

A fast, compact, and comprehensve method to deep copy any JavaScript data type
---
Commonly used deep copy routines tend to fall into two categories:

- Fast and small – but not comprehensive
- comprehensive – but large and slow

**deep-copy-all** is comprehensive, correctly copying all JavaScript standard
and custom types. But it is also fast and compact,
ranking near the top on benchmark speed tests.

## Installation
```shell script
$ npm install deep-copy-all --save
```

## Usage
Node.js
````js
const deepCopy = require('deep-copy-all');

// ...

copy = deepCopy(source);
````

--- 

## `deepCopy()`
Perform a deep copy of a JavaScript object or array.
#### Syntax
````
deepCopy(source [, options])
````
#### Parameters
`source`<br>
&nbsp;&nbsp;&nbsp; The item to copy.

`options`<br>
&nbsp;&nbsp;&nbsp; *[optional]* - an object that modifies copying behavior.

&nbsp;&nbsp;&nbsp; Properties of *options*:

&nbsp;&nbsp;&nbsp; `goDeep` - boolean<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Perform deep copy if **true** (default).
Set to **false** to perform shallow copy.

&nbsp;&nbsp;&nbsp; `includeNonEnumerable` - boolean<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Copy non-enumerable properties if
**true**, default is **false**.

#### Return value
The copied data.

---

## Performance
The following data types — as the source passed to deepCopy or embedded within
the source — have been verified to be copied correctly:

- `Array`
- `ArrayBuffer`
- `Date`
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

The following object types are not copied, as there is no known way to copy
them. They are copied by reference only:

- `Function`
- `WeakMap`
- `WeakSet`

## Benchmark

In a standard
[benchmark test](https://github.com/ahmadnassri/benchmark-node-clone)
of 14 commonly used deep copy modules, **deep-copy-all**
was 4th fastest.

