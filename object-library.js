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
    makeShallow: src => new RegExp(src),
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
  "arraybuffer": {
    type: ArrayBuffer,
    makeShallow: buffer => buffer.slice(0)
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
  "weakset" : {
    type: WeakSet,
    makeShallow: wset => wset
  },
  "weakmap" : {
    type: WeakMap,
    makeShallow: wmap => wmap
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

module.exports = [
  isPrimitive,
  objectType,
  objectBehaviors
]