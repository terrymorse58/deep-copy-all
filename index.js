"use strict";

/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Boolean} options.goDeep - perform deep copy
 * @param {Boolean} options.includeNonEnumerable - copy non-enumerables
 * @return {*}
 */
module.exports = function deepCopy(source,
  options) {
  const {goDeep: goDeep, includeNonEnumerable: includeNonEnumerable} = options;

  if (!goDeep) {
    return objectBehaviors[objectType(source)].makeShallow(source);;
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
  copyObject(source, dest, sourceType, includeNonEnumerable);
  return dest;
};

/**
 * copy source object to destination object
 * @param {[]|{}} srcObject
 * @param {[]|{}} destObject
 * @param {string|null} [srcType] - (proto)type of the source object
 * @param {Boolean=true} copyNonEnumerables - copy non-enumerable elements
 */
const copyObject = (srcObject, destObject,
  srcType = null, copyNonEnumerables = true) => {
  // TODO check for circular references
  srcType = srcType || objectType(srcObject);
  const srcBehavior = objectBehaviors[srcType];

  if (!srcBehavior.mayDeepCopy) {
    return;
  }
  const addElement = srcBehavior.addElement;
  const objIterate = srcBehavior.iterate;

  // iterate over object's elements
  objIterate(srcObject, copyNonEnumerables, (elInfo) => {
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

    copyObject(elValue, elNew, elType, copyNonEnumerables);
  });
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
      return name;
    }
  }
  return 'unknown';
}

/*
  define object behaviors
  type - data type of the object
  mayDeepCopy - true if object may be deep copied
  addElement - add a new element to the object
  makeEmpty - make a new, empty object
  makeShallow - make a shallow copy of object
  iterate - iterate over elements with callback({key,value,"type"})
  NOTE: The order is important - custom objects must be defined before the
        standard JavaScript Object.
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
    iterate: (array, skipNonEnuerables, callback) => {
      const len = array.length;
      for (let i = 0; i < len; i++) {
        const val = array[i];
        const elInfo = {
          key: i,
          value: val,
          type: objectType(val)
        }
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
    makeShallow: src => src,
  },
  'function': {
    type: Function,
    makeShallow: fn => fn,
  },
  "int8array": {
    type: Int8Array,
    makeShallow: source => Int8Array.from(source),
  },
  "uint8array": {
    type: Uint8Array,
    makeShallow: source => Uint8Array.from(source),
  },
  "uint8clampedarray": {
    type: Uint8ClampedArray,
    makeShallow: source => Uint8ClampedArray.from(source),
  },
  "int16array": {
    type: Int16Array,
    makeShallow: source => Int16Array.from(source),
  },
  "uint16array": {
    type: Uint16Array,
    makeShallow: source => Uint16Array.from(source),
  },
  "int32array": {
    type: Int32Array,
    makeShallow: source => Int32Array.from(source),
  },
  "uint32array": {
    type: Uint32Array,
    makeShallow: source => Uint32Array.from(source),
  },
  "float32array": {
    type: Float32Array,
    makeShallow: source => Float32Array.from(source),
  },
  "float64array": {
    type: Float64Array,
    makeShallow: source => Float64Array.from(source),
  },
  "bigint64array": {
    type: BigInt64Array,
    makeShallow: source => BigInt64Array.from(source),
  },
  "biguint64array": {
    type: BigUint64Array,
    makeShallow: source => BigUint64Array.from(source),
  },
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
      })
    }
  },
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
      })
    }
  },
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
};

// true if the item is a primitive data type
const isPrimitive = (item) => {
  let type = typeof item;
  return type === 'number' || type === 'string' || type === 'boolean'
    || type === 'undefined' || type === 'bigint' || type === 'symbol'
    || item === null;
}
