(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.deepCopy = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// object library - specific behaviors for each object type

const objectBehaviors = {};

// return true if item is a primitive data type
const isPrimitive = (item) => {
  let type = typeof item;
  return type === 'number' || type === 'string' || type === 'boolean'
    || type === 'undefined' || type === 'bigint' || type === 'symbol'
    || item === null;
};

// establish a "type" keyword for an object
const objectType = (obj) => {

  // match primitives right away
  if (isPrimitive(obj) || !(obj instanceof Object)) {
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
};

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

const arrayAddElement = (array, key, value) =>
  Array.prototype.push.call(array, value);

const arrayMakeEmpty = source => {
  const newArray = [];
  Object.setPrototypeOf(newArray, Object.getPrototypeOf(source));
  return newArray;
};

const arrayMakeShallow = source => {
  const dest = [...source];
  Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
  return dest;
};

const arrayIterate = (array, copyNonEnumerables, callback) => {
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
};

const addArrayBehavior = () => {
  Object.assign(objectBehaviors, {
    'array': {
      type: Array,
      mayDeepCopy: true,
      addElement: arrayAddElement,
      makeEmpty: arrayMakeEmpty,
      makeShallow: arrayMakeShallow,
      iterate: arrayIterate
    }
  });
};

const addDateBehavior = () => {
  Object.assign(objectBehaviors, {
    'date': {
      type: Date,
      makeShallow: date => new Date(date.getTime()),
    }
  });
};

const addRegExpBehavior = () => {
  Object.assign(objectBehaviors, {
    'regexp': {
      type: RegExp,
      makeShallow: src => new RegExp(src),
    }
  });
};

const addFunctionBehavior = () => {
  Object.assign(objectBehaviors, {
    'function': {
      type: Function,
      makeShallow: fn => fn,
    }
  });
};

const addErrorBehavior = () => {
  Object.assign(objectBehaviors, {
    'error': {
      type: Error,
      makeShallow: err => {
        const errCopy = new Error(err.message);
        errCopy.stack = err.stack;
        return errCopy;
      }
    }
  });
};

// in case they don't exist, perform existence checks on these
// types before adding them

// add a named TypedArray to objectBehaviors
const addTypedArrayBehavior = (name) => {
  let type = (typeof global !== 'undefined' && global[name])
    || (typeof window !== 'undefined' && window[name])
    || (typeof WorkerGlobalScope !== 'undefined' && WorkerGlobalScope[name]);
  if (typeof type !== 'undefined') {
    objectBehaviors[name.toLowerCase()] = {
      type,
      makeShallow: source => type.from(source)
    };
  }
};

const addAllTypedArrayBehaviors = () => {
  const typedArrayNames = [
    'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
    'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
    'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'
  ];
  typedArrayNames.forEach(name => addTypedArrayBehavior(name));
};

const addArrayBufferBehavior = () => {
  if (typeof ArrayBuffer !== 'undefined') {
    Object.assign(objectBehaviors, {
      'arraybuffer': {
        type: ArrayBuffer,
        makeShallow: buffer => buffer.slice(0)
      }
    });
  }
};

const addMapBehavior = () => {
  if (typeof Map === 'undefined') { return; }
  Object.assign(objectBehaviors, {
    'map': {
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
          };
          callback(elInfo);
        });
      }
    }
  });
};

const addSetBehavior = () => {
  if (typeof Set === 'undefined') { return; }
  Object.assign(objectBehaviors, {
    'set': {
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
          };
          callback(elInfo);
        });
      }
    }
  });
};

const addWeakSetBehavior = () => {
  if (typeof WeakSet === 'undefined') { return; }
  Object.assign(objectBehaviors, {
    'weakset': {
      type: WeakSet,
      makeShallow: wset => wset
    }
  });
};

const addWeakMapBehavior = () => {
  if (typeof WeakMap === 'undefined') { return; }
  Object.assign(objectBehaviors, {
    'weakmap': {
      type: WeakMap,
      makeShallow: wmap => wmap
    }
  });
};

// node.js Buffer
const addBufferBehavior = () => {
  if (typeof Buffer === 'undefined') { return; }
  Object.assign(objectBehaviors, {
    'buffer': {
      type: Buffer,
      makeShallow: buf => Buffer.from(buf)
    }
  });
};

// always include Object, primitive, unknown
const objectAddElement = (obj, key, value, descriptor = undefined) => {
  if (!descriptor) {
    obj[key] = value;
  } else {
    Object.defineProperty(obj, key, descriptor);
  }
};

const objectMakeEmpty = source => {
  const newObj = {};
  Object.setPrototypeOf(newObj, Object.getPrototypeOf(source));
  return newObj;
};

const objectMakeShallow = source => {
  const dest = Object.assign({}, source);
  Object.setPrototypeOf(dest, Object.getPrototypeOf(source));
  return dest;
};

const objectIterate = (obj, copyNonEnumerables, callback) => {
  const keys = copyNonEnumerables ?
    Object.getOwnPropertyNames(obj) : Object.keys(obj);
  const len = keys.length;
  for (let i = 0; i < len; i++) {
    const key = keys[i], value = obj[key], elInfo = {
      key, value, type: objectType(value)
    };
    if (copyNonEnumerables && !obj.propertyIsEnumerable(key)) {
      elInfo.descriptor = Object.getOwnPropertyDescriptor(obj, key);
    }
    callback(elInfo);
  }
};

const addObjectBehavior = () => {
  Object.assign(objectBehaviors, {
    'object': {
      type: Object,
      mayDeepCopy: true,
      addElement: objectAddElement,
      makeEmpty: objectMakeEmpty,
      makeShallow: objectMakeShallow,
      iterate: objectIterate
    }
  });
};

const addUnknownAndPrimitive = () => {
  Object.assign(objectBehaviors, {
    'unknown': {
      makeShallow: source => source
    },
    'primitive': {
      makeShallow: source => source
    }
  });
};

addArrayBehavior();
addDateBehavior();
addRegExpBehavior();
addFunctionBehavior();
addErrorBehavior();
addAllTypedArrayBehaviors();
addArrayBufferBehavior();
addMapBehavior();
addSetBehavior();
addWeakSetBehavior();
addWeakMapBehavior();
addBufferBehavior();
addObjectBehavior();
addUnknownAndPrimitive();

/**
 * object actions as defined in objectBehaviors { }
 * @typedef {Object} ObjectActions
 * @property {Boolean} mayDeepCopy
 * @property {Function} addElement
 * @property {Function} makeEmpty
 * @property {Function} makeShallow
 * @property {Function} iterate
 */
/**
 * return object actions for the named typed
 * @param {string} typeName
 * @return {ObjectActions}
 */
function objectActions(typeName) {
  return objectBehaviors[typeName];
}

module.exports = [
  isPrimitive,
  objectType,
  objectActions
];

},{}],2:[function(require,module,exports){
"use strict";

const [ isPrimitive, objectType, objectActions ] =
  require('./dca-library.js');

/**
 * copy options for deep-copy-all
 * @typedef {Object} CopyOptions
 * @property {boolean} goDeep
 * @property {boolean} includeNonEnumerable
 * @property {boolean} detectCircular
 * @property {number} maxDepth
 */

/**
 * args for copyObjectContents()
 * @typedef {Object} CopyArgs
 * @property {Object} destObject
 * @property {string} srcType
 * @property {Watcher} watcher
 * @property {CopyOptions|Object} options
 */


/** @type {CopyOptions} **/
const defaultOpts = {
  goDeep: true,
  includeNonEnumerable: false,
  detectCircular: true,
  maxDepth: 20
};
function setMissingOptions(options) {
  Object.keys(defaultOpts).forEach(optName => {
    if (typeof options[optName] === 'undefined') {
      options[optName] = defaultOpts[optName];
    }
  });
}

// watch for circular references
class Watcher {
  constructor () {
    this._seenMap = new WeakMap();
  }

  setAsCopied(obj, copy) {
    if (!(obj instanceof Object)) {return;}
    this._seenMap.set(obj, copy);
  }

  wasCopied(obj) {
    if (!(obj instanceof Object)) { return false; }
    return this._seenMap.has(obj);
  }

  getCopy(obj) {
    return this._seenMap.get(obj);
  }
}

/**
 * make copy of element
 * @param {Object} element
 * @param {ObjectActions} elActions
 * @param {Object} args
 * @param {CopyOptions|Object} args.options
 * @param {Watcher} args.watcher
 * @return {*}
 */
function copyElement(element, elActions,
  args) {
  const {options, watcher} = args;
  let copy;
  if (elActions.mayDeepCopy) {
    copy = elActions.makeEmpty(element);
    if (options.detectCircular) {watcher.setAsCopied(element, copy);}
  } else {
    copy = elActions.makeShallow(element);
  }
  return copy;
}

function checkForExceededDepth(depth, maxDepth) {
  if (depth >= maxDepth) {
    // console.log('copyObjectContents max depth exceeded srcObject:',srcObject);
    throw `Error max depth of ${maxDepth} levels exceeded, possible circular reference`;
  }
}


/**
 * copy source object contents to destination object (recursive)
 * @param {[]|{}} srcObject
 * @param {CopyArgs} args
 * @param {number} depth
 */
const copyObjectContents = (srcObject, args, depth) => {
  const {destObject, srcType, watcher, options} = args;
  const detectCircular = options.detectCircular;

  checkForExceededDepth(++depth, options.maxDepth);

  const objActions = objectActions(srcType);
  if (!objActions.mayDeepCopy) { return; }

  const addElementToObject = objActions.addElement;

  // iterate over source object's elements
  objActions.iterate(srcObject, options.includeNonEnumerable, (elInfo) => {
    const elValue = elInfo.value, elType = elInfo.type,
      elActions = objectActions(elType);
    let elSeenBefore = false, elCopy;

    // create copy of source element
    if (detectCircular && watcher.wasCopied(elValue)) {
      // console.log('copyObjectContents was seen, using reference elValue:',
      // elValue);
      elCopy = watcher.getCopy(elValue);
      elSeenBefore = true;
    } else {
      elCopy = copyElement(elValue, elActions, {options, watcher});
    }

    addElementToObject(destObject, elInfo.key, elCopy, elInfo.descriptor);

    if (!elActions.mayDeepCopy || elSeenBefore) { return; }

    copyObjectContents(elValue,
      { destObject: elCopy, srcType: elType, watcher, options }, depth);
  });
};

/**
 * return deep copy of the source
 * @param {Date|[]|{}} source
 * @param {CopyOptions} options
 * @return {*}
 */
function deepCopy (source, options = defaultOpts) {
  setMissingOptions(options);

  // don't deep copy primitives
  if (isPrimitive(source)) { return source;}

  const srcType = objectType(source);
  const srcActions = objectActions(srcType);

  if (!options.goDeep || !srcActions.mayDeepCopy) {
    return srcActions.makeShallow(source);
  }

  // create watcher for circular references
  const watcher = (options.detectCircular) ? new Watcher() : null;

  // recursive copy: make empty object to be filled by copyObjectContents
  let destObject = srcActions.makeEmpty(source);

  if (options.detectCircular) { watcher.setAsCopied(source, destObject); }

  // copy contents of source object to destination object
  copyObjectContents(source, { destObject, srcType, watcher, options }, 0);
  return destObject;
}

module.exports = deepCopy;

},{"./dca-library.js":1}]},{},[2])(2)
});
