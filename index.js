"use strict";

const [ isPrimitive, objectType, objectActions ] =
  require('./object-library.js');

/**
 * @typedef {Object} CopyOptions
 * @property {boolean} goDeep
 * @property {boolean} includeNonEnumerable
 * @property {boolean} detectCircular
 * @property {number} maxDepth
 */

/** @type {CopyOptions} **/
const defaultOpts = {
  goDeep: true,
  includeNonEnumerable: false,
  detectCircular: true,
  maxDepth: 20
};

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
 * args to copyObjectContents
 * @typedef {Object} CopyArgs
 * @property {Object} destObject
 * @property {string} srcType
 * @property {Watcher} watcher
 * @property {Object} options
 */

/**
 * copy source object contents to destination object (recursive)
 * @param {[]|{}} srcObject
 * @param {CopyArgs} args
 * @param {number} depth
 */
const copyObjectContents = (srcObject, args, depth) => {
  const {destObject, srcType, watcher, options} = args;
  const detectCircular = options.detectCircular;

  if (++depth >= options.maxDepth) {
    // console.log('copyObjectContents max depth exceeded srcObject:',srcObject);
    throw `Error max depth of ${options.maxDepth} levels exceeded, possible circular reference`;
  }

  const objActions = objectActions(srcType);
  if (!objActions.mayDeepCopy) { return; }

  const addElementToObject = objActions.addElement;

  // iterate over source object's elements
  objActions.iterate(srcObject, options.includeNonEnumerable, (elInfo) => {
    const elValue = elInfo.value, elType = elInfo.type;
    const elActions = objectActions(elType);
    let elMayDeepCopy = elActions.mayDeepCopy;
    let elSeenBefore = false;
    let elCopy;

    // create copy of source element
    if (detectCircular && watcher.wasCopied(elValue)) {
      // console.log('copyObjectContents was seen, using reference elValue:', elValue);
      elCopy = watcher.getCopy(elValue);
      elSeenBefore = true;
    } else if (elMayDeepCopy) {
      elCopy = elActions.makeEmpty(elValue);
      if (detectCircular) {watcher.setAsCopied(elValue, elCopy);}
    } else {
      elCopy = elActions.makeShallow(elValue);
    }

    addElementToObject(destObject, elInfo.key, elCopy, elInfo.descriptor);

    if (!elMayDeepCopy || elSeenBefore) { return; }

    copyObjectContents(elValue, {
      destObject: elCopy,
      srcType: elType,
      watcher,
      options }, depth);
  });
};

/**
 * return deep copy of the source
 * @param {Date|[]|{}} source
 * @param {CopyOptions} options
 * @return {*}
 */
function deepCopy (source, options = defaultOpts) {

  Object.keys(defaultOpts).forEach(optName => {
    if (typeof options[optName] === 'undefined') {
      options[optName] = defaultOpts[optName];
    }
  });

  // console.log('deepCopy options:', options);

  // don't deep copy primitives
  if (isPrimitive(source)) { return source;}

  const srcType = objectType(source);
  const srcActions = objectActions(srcType);
  const mayDeepCopy = srcActions.mayDeepCopy;

  if (!options.goDeep || !mayDeepCopy) {
    return srcActions.makeShallow(source);
  }

  // create watcher for circular references
  const watcher = (options.detectCircular) ? new Watcher() : null;

  // for recursive copy, make empty object to be filled by copyObjectContents
  let destObject = srcActions.makeEmpty(source);

  if (options.detectCircular) {
    watcher.setAsCopied(source, destObject);
  }

  // copy contents of source object to destination object
  copyObjectContents(source, {
    destObject,
    srcType,
    watcher,
    options
  }, 0);
  return destObject;
}

module.exports = deepCopy;
