(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.deepCopy = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

const [ isPrimitive, objectType, objectBehaviors] =
  require('./object-library.js');

const defaultOptions = {
  goDeep: true,
  includeNonEnumerable: false,
  maxDepth: 20
};

/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Boolean=true} options.goDeep - perform deep copy
 * @param {Boolean=false} options.includeNonEnumerable - copy non-enumerables
 * @param {number=20} options.maxDepth - maximum levels of depth
 * @return {*}
 */
module.exports = function deepCopy (source, options) {

  options = options || defaultOptions;
  if (typeof options.goDeep === 'undefined') {
    options.goDeep = defaultOptions.goDeep;
  }
  if (typeof options.includeNonEnumerable === 'undefined') {
    options.includeNonEnumerable = defaultOptions.includeNonEnumerable;
  }
  if (typeof options.maxDepth === 'undefined') {
    options.maxDepth = defaultOptions.maxDepth;
  }


  if (!options.goDeep) {
    return objectBehaviors[objectType(source)].makeShallow(source);
  }

  if (!source || isPrimitive(source)) {
    return source;
  }

  const sourceType = objectType(source);
  const mayDeepCopy = objectBehaviors[sourceType].mayDeepCopy;
  if (!mayDeepCopy) {
    return objectBehaviors[sourceType].makeShallow(source);
  }

  let dest = objectBehaviors[sourceType].makeEmpty(source);
  copyObject(source, dest, sourceType, 0, options);
  return dest;
}

/**
 * copy source object to destination object
 * @param {[]|{}} srcObject
 * @param {[]|{}} destObject
 * @param {string} srcType - (proto)type name of the source object
 * @param {number} depth - current depth of recursion
 * @param {object} options
 * @param {Boolean} options.includeNonEnumerable - copy non-enumerables
 * @param {number} options.maxDepth - maximum depth of recursion
 */
const copyObject = (srcObject, destObject,
  srcType, depth,
  options) => {

  // TODO check for circular references

  depth++;
  if (depth >= options.maxDepth) {
    console.log('copyObject too deep, depth:',depth,',obj:',srcObject);
    return;
  }

  const srcBehavior = objectBehaviors[srcType];
  if (!srcBehavior.mayDeepCopy) {
    return;
  }
  const addElement = srcBehavior.addElement;
  const objIterate = srcBehavior.iterate;

  // iterate over object's elements
  objIterate(srcObject, options.includeNonEnumerable, (elInfo) => {
    const elValue = elInfo.value, elType = elInfo.type;
    let elMayDeepCopy = objectBehaviors[elType].mayDeepCopy;

    let elNew;
    if (elMayDeepCopy) {
      elNew = objectBehaviors[elType].makeEmpty(elValue);
    } else {
      elNew = objectBehaviors[elType].makeShallow(elValue);
    }

    addElement(destObject, elInfo.key, elNew, elInfo.descriptor);

    if (!elMayDeepCopy) { return; }

    copyObject(elValue, elNew, elType, depth, options);
  });
}


},{"./object-library.js":2}],2:[function(require,module,exports){
// object library - specific behaviors for each object type

// return true if the item is a primitive data type
const isPrimitive = (item) => {
  let type = typeof item;
  return type === 'number' || type === 'string' || type === 'boolean'
    || type === 'undefined' || type === 'bigint' || type === 'symbol'
    || item === null;
}

// establish a "type" keyword for an object
const objectType = (obj) => {

  // match primitives right away
  if (isPrimitive(obj) || !obj instanceof Object) {
    return 'primitive';
  }

  // try to match object constructor name
  const consName = obj.constructor && obj.constructor.name
    && obj.constructor.name.toLowerCase();
  if (typeof consName === 'string' && consName.length
    && objectBehaviors[consName]) {
    return consName;
  }

  // try to match by looping through objectBehaviors type property
  let typeTry;
  for (const name in objectBehaviors) {
    typeTry = objectBehaviors[name].type;
    if (!typeTry || obj instanceof typeTry) {
      // console.log('objectType matched in a fall-back loop name:',name);
      return name;
    }
  }
  return 'unknown';
}

/**
 * define object behaviors
 * Note: The order is important - custom objects must be listed BEFORE
 *       the standard JavaScript Object.
 * @namespace
 * @property {*} type - object data "type"
 * @property {Boolean} [mayDeepCopy] - true if object may be deep copied
 * @property {function} [addElement] - add a single element to object
 * @property {function} [makeEmpty] - make an empty object
 * @property {function} makeShallow - make shallow copy of object
 * @property {function} [iterate] - iterate over objects elements
 *                                  with callback({key,value,"type"})
 */
const objectBehaviors = {
  "array": {
    type: Array,
    mayDeepCopy: true,
    addElement: (array, key, value) => Array.prototype.push.call(array, value),
    makeEmpty: source => {
      const newArray = [];
      Object.setPrototypeOf(newArray, Object.getPrototypeOf(source));
      return newArray;
    },
    makeShallow: source => {
      const dest = [...source];
      Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
      return dest;
    },
    iterate: (array, copyNonEnumerables, callback) => {
      const len = array.length;
      for (let i = 0; i < len; i++) {
        const val = array[i];
        const elInfo = {
          key: i,
          value: val,
          type: objectType(val)
        };
        callback(elInfo);
      }
    }
  },
  "date": {
    type: Date,
    makeShallow: date => new Date(date.getTime()),
  },
  "regexp": {
    type: RegExp,
    makeShallow: src => new RegExp(src),
  },
  'function': {
    type: Function,
    makeShallow: fn => fn,
  },
  'error': {
    type: Error,
    makeShallow: err => {
      const errCopy = new Error(err.message);
      errCopy.stack = err.stack;
      return errCopy;
    }
  }
};

// in case they don't exist, perform existence checks on these
// types before adding them

if (typeof Int8Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "int8array": {
      type: Int8Array,
      makeShallow: source => Int8Array.from(source),
    }
  });
}

if (typeof Uint8Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "uint8array": {
      type: Uint8Array,
      makeShallow: source => Uint8Array.from(source),
    }
  });
}

if (typeof Uint8ClampedArray !== 'undefined') {
  Object.assign(objectBehaviors, {
    "uint8clampedarray": {
      type: Uint8ClampedArray,
      makeShallow: source => Uint8ClampedArray.from(source),
    }
  });
}

if (typeof Int16Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "int16array": {
      type: Int16Array,
      makeShallow: source => Int16Array.from(source),
    }
  });
}

if (typeof Uint16Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "uint16array": {
      type: Uint16Array,
      makeShallow: source => Uint16Array.from(source),
    }
  });
}

if (typeof Int32Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "int32array": {
      type: Int32Array,
      makeShallow: source => Int32Array.from(source),
    }
  });
}

if (typeof Uint32Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "uint32array": {
      type: Uint32Array,
      makeShallow: source => Uint32Array.from(source),
    }
  });
}

if (typeof Float32Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "float32array": {
      type: Float32Array,
      makeShallow: source => Float32Array.from(source),
    }
  });
}

if (typeof Float64Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "float64array": {
      type: Float64Array,
      makeShallow: source => Float64Array.from(source),
    }
  });
}

if (typeof BigInt64Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "bigint64array": {
      type: BigInt64Array,
      makeShallow: source => BigInt64Array.from(source),
    }
  });
}

if (typeof BigUint64Array !== 'undefined') {
  Object.assign(objectBehaviors, {
    "biguint64array": {
      type: BigUint64Array,
      makeShallow: source => BigUint64Array.from(source),
    }
  });
}

if (typeof ArrayBuffer !== 'undefined') {
  Object.assign(objectBehaviors, {
    "arraybuffer": {
      type: ArrayBuffer,
      makeShallow: buffer => buffer.slice(0)
    }
  });
}

if (typeof Map !== 'undefined') {
  Object.assign(objectBehaviors, {
    "map": {
      type: Map,
      mayDeepCopy: true,
      addElement: (map, key, value) => map.set(key, value),
      makeEmpty: () => new Map(),
      makeShallow: sourceMap => new Map(sourceMap),
      iterate: (map, copyNonEnumerables, callback) => {
        map.forEach((val, key) => {
          const elInfo = {
            key: key,
            value: val,
            type: objectType(val)
          }
          callback(elInfo);
        });
      }
    }
  });
}

if (typeof Set !== 'undefined') {
  Object.assign(objectBehaviors, {
    "set": {
      type: Set,
      mayDeepCopy: true,
      addElement: (set, key, value) => set.add(value),
      makeEmpty: () => new Set(),
      makeShallow: set => new Set(set),
      iterate: (set, copyNonEnumerables, callback) => {
        set.forEach(val => {
          const elInfo = {
            key: null,
            value: val,
            type: objectType(val)
          }
          callback(elInfo);
        });
      }
    }
  });
}

if (typeof WeakSet !== 'undefined') {
  Object.assign(objectBehaviors, {
    "weakset" : {
      type: WeakSet,
      makeShallow: wset => wset
    }
  });
}

if (typeof WeakMap !== 'undefined') {
  Object.assign(objectBehaviors, {
    "weakmap" : {
      type: WeakMap,
      makeShallow: wmap => wmap
    }
  });
}

// node.js Buffer
if (typeof Buffer !== 'undefined') {
  Object.assign(objectBehaviors, {
    "buffer" : {
      type: Buffer,
      makeShallow: buf => Buffer.from(buf)
    }
  });
}

// always include Object, primitive, unknown
Object.assign(objectBehaviors, {
  "object": {
    type: Object,
    mayDeepCopy: true,
    addElement: (obj, key, value, descriptor = undefined) => {
      if (!descriptor) {
        obj[key] = value;
      } else {
        Object.defineProperty(obj, key, descriptor);
      }
    },
    makeEmpty: source => {
      const newObj = {};
      Object.setPrototypeOf(newObj, Object.getPrototypeOf(source));
      return newObj;
    },
    makeShallow: source => {
      const dest = Object.assign({}, source);
      Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
      return dest;
    },
    iterate: (obj, copyNonEnumerables, callback) => {
      const keys = copyNonEnumerables ?
        Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        const value = obj[key];
        const elInfo = {
          key: key,
          value: value,
          type: objectType(value),
        }
        if (copyNonEnumerables && !obj.propertyIsEnumerable(key)) {
          elInfo.descriptor = Object.getOwnPropertyDescriptor(obj, key);
        }
        callback(elInfo);
      }
    }
  },
  "unknown": {
    makeShallow: source => source
  },
  "primitive": {
    makeShallow: source => source
  }
});

module.exports = [
  isPrimitive,
  objectType,
  objectBehaviors
]
},{}]},{},[1])(1)
});
