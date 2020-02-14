"use strict";

const [ isPrimitive, objectType, objectBehaviors] =
  require('./object-library.js');

const defaultOpts = {
  goDeep: true,
  includeNonEnumerable: false,
  maxDepth: 20
};

/**
 * args to copyObject
 * @typedef {Object} CopyArgs
 * @property {Object} destObject
 * @property {string} srcType
 * @property {number} depth
 * @property {Object} options
 */

/**
 * copy source object to destination object recursively
 * @param {[]|{}} srcObject
 * @param {CopyArgs} args
 */
const copyObject = (srcObject, args) => {
  let {destObject, srcType, depth, options} = args;

  if (++depth >= options.maxDepth) { return; }

  const srcBehavior = objectBehaviors[srcType];
  if (!srcBehavior.mayDeepCopy) { return; }

  const addElementToSource = srcBehavior.addElement;

  // iterate over object's elements
  srcBehavior.iterate(srcObject, options.includeNonEnumerable, (elInfo) => {
    const elValue = elInfo.value, elType = elInfo.type;
    let elMayDeepCopy = objectBehaviors[elType].mayDeepCopy;

    let elNew = (elMayDeepCopy)
      ? objectBehaviors[elType].makeEmpty(elValue)
      : objectBehaviors[elType].makeShallow(elValue);

    addElementToSource(destObject, elInfo.key, elNew, elInfo.descriptor);

    if (!elMayDeepCopy) { return; }

    copyObject(elValue, { destObject: elNew, srcType: elType,
      depth: depth, options: options });
  });
};

/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Object} options
 * @param {Boolean=true} options.goDeep - perform deep copy
 * @param {Boolean=false} options.includeNonEnumerable - copy non-enumerables
 * @param {number=20} options.maxDepth - maximum levels of depth
 * @return {*}
 */
function deepCopy (source, options = defaultOpts) {

  Object.keys(defaultOpts).forEach(optName => {
    if (typeof options[optName] === 'undefined') {
      options[optName] = defaultOpts[optName];
    }
  });

  // don't copy primitives
  if (isPrimitive(source)) { return source;}

  // shallow copy option
  if (!options.goDeep) {
    return objectBehaviors[objectType(source)].makeShallow(source);
  }

  const sourceType = objectType(source);
  const mayDeepCopy = objectBehaviors[sourceType].mayDeepCopy;

  // not deep copyable, do a shallow copy
  if (!mayDeepCopy) {
    return objectBehaviors[sourceType].makeShallow(source);
  }

  // do recursive deep copy
  let dest = objectBehaviors[sourceType].makeEmpty(source);
  copyObject(source, {destObject: dest, srcType: sourceType,
      depth: 0, options: options });
  return dest;
}

module.exports = deepCopy;
