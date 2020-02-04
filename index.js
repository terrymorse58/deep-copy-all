"use strict";

/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Boolean=true} goDeep - perform deep copy
 * @return {*}
 */
module.exports = function deepCopy(source, goDeep = true) {
  let dest;

  if (!goDeep) {
    return shallowCopy(source);
  }

  if (!source || isPrimitive(source)) {
    return source;
  }

  const sourceType = objectType(source);
  const mayDeepCopy = objectBehaviors[sourceType].mayDeepCopy;
  if (!mayDeepCopy) {
    dest = objectBehaviors[sourceType].makeShallow(source);
    return dest;
  }

  dest = objectBehaviors[sourceType].makeNew(source);
  traverse(source, dest);
  return dest;
};

/**
 * perform a shallow copy of source
 * @param {*} source
 * @return {*}
 */
function shallowCopy(source) {
  const sourceType = objectType(source);
  const makeShallow = objectBehaviors[sourceType].makeShallow;
  return makeShallow(source);
}

/**
 * traverse source object and copy to destination object
 * @param {[]|{}} srcObject
 * @param {[]|{}} destObject
 */
function traverse(srcObject, destObject) {
  // TODO check for circular references
  const srcType = objectType(srcObject);

  // console.log('traverse srcType:',srcType);

  if (!objectBehaviors[srcType].mayDeepCopy) {
    return;
  }

  const srcKeyVals = objectBehaviors[srcType].keyVals(srcObject);
  const addElement = objectBehaviors[srcType].addElement;
  srcKeyVals.forEach(element => {
    const {
      key: elKey,
      value: elValue,
      descriptor: elDescriptor
    } = element;
    const elType = objectType(elValue);
    const mayDeepCopy = objectBehaviors[elType].mayDeepCopy;
    const elNew = mayDeepCopy
      ? objectBehaviors[elType].makeNew(elValue)
      : objectBehaviors[elType].makeShallow(elValue);
    addElement(destObject, elKey, elNew, elDescriptor);
    traverse(elValue, elNew);
  });
} // establish a keyword for an object

// names to identify types of objects
const typeNames = {
  "regexp": RegExp,
  "date": Date,
  "function": Function,
  "array": Array,
  "int8array": Int8Array,
  "uint8array": Uint8Array,
  "uint8clampledarray": Uint8ClampedArray,
  "map": Map,
  "weakmap": WeakMap,
  "set": Set,
  "weakset": WeakSet,
  "object": Object
};

function objectType(obj) {
  if (!obj || !obj instanceof Object) {
    return 'unknown';
  }
  for (const name in objectBehaviors) {
    if (obj instanceof objectBehaviors[name].type) {
      console.log('objectType name: ',name);
      return name;
    }
  }
  return 'unknown';
}

/*
  object behaviors
  addElement: add a new element to the object
  makeNew: make a new, empty object
  makeShallow: make a shallow copy of source
  keyVals: make array of {key,value} pairs for object elements
  mayDeepCopy: true if object may be deep copied
*/
const objectBehaviors = {
  "array": {
    type: Array,
    addElement: (array, key, value) => Array.prototype.push.call(array, value),
    makeNew: source => {
      const newArray = [];
      Object.setPrototypeOf(newArray, Object.getPrototypeOf(source));
      return newArray;
    },
    makeShallow: source => {
      const dest = [...source];
      Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
      return dest;
    },
    keyVals: array => {
      let kvPairs = [];
      array.forEach((val, index) => {
        kvPairs.push({
          key: index,
          value: val
        });
      });
      return kvPairs;
    },
    mayDeepCopy: true
  },
  "int8array": {
    type: Int8Array,
    makeShallow: source => Int8Array.from(source),
  },
  "uint8array": {
    type: Uint8Array,
    makeShallow: source => Uint8Array.from(source),
  },
  "uint8clampledarray": {
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
  "date": {
    type: Date,
    makeShallow: date => new Date(date.getTime()),
  },
  "regexp": {
    type: RegExp,
    makeShallow: src => src,
    keyVals: () => null,
  },
  "map": {
    type: Map,
    addElement: (map, key, value) => map.set(key, value),
    makeNew: () => new Map(),
    makeShallow: sourceMap => new Map(sourceMap),
    keyVals: map => {
      let kvPairs = [];
      map.forEach((val, key) => {
        kvPairs.push({
          key: key,
          value: map.get(key)
        });
      });
      return kvPairs;
    },
    mayDeepCopy: true
  },
  "set": {
    type: Set,
    addElement: (set, key, value) => set.add(value),
    makeNew: () => new Set(),
    makeShallow: set => new Set(set),
    keyVals: set => {
      let kvPairs = [];
      set.forEach(val => {
        kvPairs.push({
          key: null,
          value: val
        });
      });
      return kvPairs;
    },
    mayDeepCopy: true
  },
  'function': {
    type: Function,
    makeShallow: fn => fn,
  },
  "object": {
    type: Object,
    addElement: (obj, key, value, descriptor = null) => {
      Object.defineProperty(obj, key, {
        ...descriptor,
        value: value
      });
    },
    makeNew: source => {
      const newObj = {};
      Object.setPrototypeOf(newObj, Object.getPrototypeOf(source));
      return newObj;
    },
    makeShallow: source => {
      const dest = Object.assign({}, source);
      Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
      return dest;
    },
    keyVals: obj => {
      let kvPairs = [];
      let propNames = Object.getOwnPropertyNames(obj);

      // console.log('"object" keyVals propNames:',propNames);

      propNames.forEach(propName => {
        const pDescriptor = Object.getOwnPropertyDescriptor(obj, propName);
        const prop = pDescriptor.value;
        kvPairs.push({
          key: propName,
          value: prop,
          descriptor: pDescriptor
        });
      });
      // console.log('"object" kvPairs:',kvPairs);
      return kvPairs;
    },
    mayDeepCopy: true
  },
  "unknown": {
    makeShallow: source => source,
  }
};
Object.defineProperty(objectBehaviors, "unknown", {
  enumerable: false
});

function isPrimitive(item) {
  let type = typeof item;
  return type === 'number' || type === 'string' || type === 'boolean'
    || type === 'undefined' || type === 'bigint' || type === 'symbol'
    || item === null;
}
