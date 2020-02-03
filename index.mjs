
/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Boolean=true} goDeep - perform deep copy
 * @return {*}
 */
export default function deepCopy (source, goDeep = true) {
  let dest;

  if (!goDeep) {
    return shallowCopy(source);
  }

  // don't copy these types
  if (!source || isReferenceToImmutable(source)) {
    return source;
  }

  const sourceType = objectType(source);

  // create empty copy with class that matches source
  dest = objectBehaviors[sourceType].makeNew(source);

  if (objectBehaviors[sourceType].mayDeepCopy) {
    traverse(source, dest);
  }

  return dest;
}

/**
 * perform a shallow copy of source
 * @param {*} source
 * @return {*}
 */
function shallowCopy (source) {
  const sourceType = objectType(source);
  const makeShallow = objectBehaviors[sourceType].makeShallow;

  return makeShallow(source);

/*
  if (sourceType === 'unknown') {
    return source;
  }
  if (sourceType === 'date') {
    return new Date(source.getTime());
  }
  if (sourceType === 'map') {
    return new Map(source);
  }
  if (sourceType === 'set') {
    return new Set(Array.from(source));
  }

  // an array or object
  let dest = objectBehaviors[sourceType].makeNew(source);
  dest = Object.assign(dest, source);
  return dest;
*/
}


/**
 * traverse source object and copy to destination object
 * @param {[]|{}} srcObject
 * @param {[]|{}} destObject
 */
function traverse (srcObject, destObject) {

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

}

// establish a keyword for an object
function objectType (obj) {
  if (isArray(obj)) {
    return 'array';
  } else if (isDate(obj)) {
    return 'date';
  } else if (isMap(obj)) {
    return 'map';
  } else if (isSet(obj)) {
    return 'set';
  }  else if (isFunction(obj)) {
    return 'function';
  } else if (isObject(obj)) {
    return 'object';
  }
  return 'unknown';
}

/*
  behaviors for objects
  addElement: add a new element to the object
  makeNew: make a new, empty object
  makeShallow: make a shallow copy of source
  keyVals: make array of {key,value} pairs for object elements
  mayDeepCopy: true if object may be deep copied
*/
const objectBehaviors = {

  "array": {
    addElement: (array, key, value) => Array.prototype.push.call(array, value),
    makeNew: (source) => {
      const newArray = [];
      Object.setPrototypeOf(newArray, Object.getPrototypeOf(source));
      return newArray;
    },
    makeShallow: (source) => {
      const dest = [...source];
      Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
      return dest;
    },
    keyVals: (array) => {
      let kvPairs = [];
      array.forEach((val,index) => {
        kvPairs.push({key: index, value: val});
      });
      return kvPairs;
    },
    mayDeepCopy: true
  },

  "date": {
    addElement: () => {},
    makeNew: (date) => new Date(date.getTime()),
    makeShallow: (date) => new Date(date.getTime()),
    keyVals: () => null,
    mayDeepCopy: false
},

  "map": {
    addElement: (map, key, value) => map.set(key, value),
    makeNew: () => new Map(),
    makeShallow: (sourceMap) => new Map(sourceMap),
    keyVals: (map) => {
      let kvPairs = [];
      map.forEach((val,key) => {
        kvPairs.push({key: key, value: map.get(key)});
      });
      return kvPairs;
    },
    mayDeepCopy: true
  },

  "set": {
    addElement: (set, key, value) => set.add(value),
    makeNew: () => new Set(),
    makeShallow: (set) => new Set(set),
    keyVals: (set) => {
      let kvPairs = [];
      set.forEach(val => {
        kvPairs.push({key: null, value: val});
      });
      return kvPairs;
    },
    mayDeepCopy: true
  },

  'function': {
    addElement: (fn, key, value) => {
      console.error(`ERORR "function" addElement (function has no elements) key ="${key}"`);
    },
    makeNew: (fn) => fn,
    makeShallow: (fn) => fn,
    keyVals: () => null,
    mayDeepCopy: false
  },

  "object": {
    addElement: (obj, key, value, descriptor = null) => {
      if (descriptor) {
        Object.defineProperty(obj, key, {...descriptor, value: value});
      } else {
        Object.defineProperty(obj, key, {value: value});
      }
      // obj[key] = value;
    },
    makeNew: (source) => {
      const newObj = {};
      Object.setPrototypeOf(newObj, Object.getPrototypeOf(source));
      return newObj;
    },
    makeShallow: (source) => {
      const dest = Object.assign({},source);
      Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
      return dest;
    },
    keyVals: (obj) => {
      let kvPairs = [];
      let propNames = Object.getOwnPropertyNames(obj);
      // console.log('"object" keyVals propNames:',propNames);
      propNames.forEach((propName) => {
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
    addElement: () => {},
    makeNew: (source) => source,
    makeShallow: (source) => source,
    keyVals: () => [],
    mayDeepCopy: false
  }
};

function isPrimitive (item) {
  let type = typeof item;
  return (type === 'number'
    || type === 'string'
    || type === 'boolean'
    || type === 'undefined'
    || type === 'bigint'
    || type === 'symbol'
    || item === null);
}

function isRegExp (item) {return item && item instanceof RegExp;}
function isDate (item) {return item && item instanceof Date;}
function isFunction (item) {return item && item instanceof Function;}
function isArray (item) {return item && item instanceof Array;}
function isMap (item) {return item && item instanceof Map;}
function isWeakMap (item) {return item && item instanceof WeakMap;}
function isSet (item) {return item && item instanceof Set;}
function isWeakSet (item) {return item && item instanceof WeakSet;}
function isObject (item) {return item && item instanceof Object;}

// returns true if item refers to an immutable or object that can't be cloned
function isReferenceToImmutable(item) {
  return isPrimitive(item) || isFunction(item) || isRegExp(item)
    || isWeakMap(item) || isWeakSet(item);
}
