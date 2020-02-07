# `deep-copy-all` #

A fast, compact, and robust method to deep copy all JavaScript data types
---

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
<script src="deep-copy-all.min.js"></script>
<script>
  /* ... */
  copy = deepCopy(source);
</script>
```

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
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {Boolean} *[optional]* - Perform deep copy
if **true** (default).<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Set to **false** to perform shallow copy.

&nbsp;&nbsp;&nbsp; `includeNonEnumerable`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {Boolean} *[optional]* -
Copies non-enumerable properties if **true**.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Skips non-enumerable properties if
**false** (default).

&nbsp;&nbsp;&nbsp; `maxDepth`<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {number} *[optional]* - the maximum
depth to copy, default is 20

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

## Benchmark ##

In a standard
[benchmark test](https://github.com/ahmadnassri/benchmark-node-clone)
of 14 commonly used deep copy modules, **deep-copy-all**
was 4th fastest.

