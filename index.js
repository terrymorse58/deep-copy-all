"use strict";

/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Boolean=true} goDeep - perform deep copy
 * @return {*}
 */
module.exports = function deepCopy(source, goDeep = true) {

  if (!goDeep) {
    return shallowCopy(source);
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
  copyObject(source, dest, sourceType);
  return dest;
};

/**
 * perform a shallow copy of source
 * @param {*} source
 * @return {*}
 */
function shallowCopy(source) {
  return objectBehaviors[objectType(source)].makeShallow(source);
}

/**
 * copy source object to destination object
 * @param {[]|{}} srcObject
 * @param {[]|{}} destObject
 * @param {string|null} [srcType] - type of the source object
 */
function copyObject(srcObject, destObject,
                  srcType = null) {
  // TODO check for circular references
  srcType = srcType || objectType(srcObject);

  // console.log('copyObject srcType:',srcType);

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
      ? objectBehaviors[elType].makeEmpty(elValue)
      : objectBehaviors[elType].makeShallow(elValue);
    addElement(destObject, elKey, elNew, elDescriptor);
    copyObject(elValue, elNew, elType);
  });
}

// establish a "type" keyword for an object
function objectType (obj) {
  //console.log('    objectType obj:',obj);
  let typeTry;

  // match primitives right away
  if (isPrimitive(obj) || !obj instanceof Object) {
    //console.log('      objectType type: primitive');
    return 'primitive';
  }

  // try to match object constructor name
  const consName = obj.constructor && obj.constructor.name
    && obj.constructor.name.toLowerCase();
  if (typeof consName === 'string' && consName.length
    && objectBehaviors[consName]) {
    //console.log(`      objectType type: ${consName} (consName)`);
    return consName;
  }

  // try to match by looping through objectBehaviors type property
  for (const name in objectBehaviors) {
    typeTry = objectBehaviors[name].type;
    //console.log(`      objectType trying: ${name}`);
    if (!typeTry || obj instanceof typeTry) {
      //console.log(`      objectType found type: ${name} (match by looping`);
      return name;
    }
  }

  //console.log('      objectType NOT found type: unknown');
  return 'unknown';
}

/*
  define object behaviors
  type - data type of the object
  mayDeepCopy - true if object may be deep copied
  addElement - add a new element to the object
  makeEmpty - make a new, empty object
  makeShallow - make a shallow copy of object
  keyVals - make array of {key,value,descriptor} for object element
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
    keyVals: array => {
      let kvPairs = [];
      array.forEach((val, index) => {
        kvPairs.push({
          key: index,
          value: val
        });
      });
      return kvPairs;
    }
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
    keyVals: map => {
      let kvPairs = [];
      map.forEach((val, key) => {
        kvPairs.push({
          key: key,
          value: map.get(key)
        });
      });
      return kvPairs;
    }
  },
  "set": {
    type: Set,
    mayDeepCopy: true,
    addElement: (set, key, value) => set.add(value),
    makeEmpty: () => new Set(),
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
    }
  },
  "object": {
    type: Object,
    mayDeepCopy: true,
    addElement: (obj, key, value, descriptor = null) => {
      Object.defineProperty(obj, key, {
        ...descriptor,
        value: value
      });
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
function isPrimitive(item) {
  let type = typeof item;
  return type === 'number' || type === 'string' || type === 'boolean'
    || type === 'undefined' || type === 'bigint' || type === 'symbol'
    || item === null;
}
