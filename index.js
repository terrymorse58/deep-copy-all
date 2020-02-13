"use strict";

const [ isPrimitive, objectType, objectBehaviors] =
  require('./object-library.js');

const defaultOpts = {
  goDeep: true,
  includeNonEnumerable: false,
  maxDepth: 20
};

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
const copyObject = (srcObject, [
  destObject,
  srcType,
  depth,
  options
]) => {

  // TODO check for circular references

  depth++;
  if (depth >= options.maxDepth) {
    // console.log('copyObject too deep, depth:',depth,',obj:',srcObject);
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

    copyObject(elValue, [elNew, elType, depth, options]);
  });
}

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

  for (const optName in defaultOpts) {
    if (typeof options[optName] === 'undefined') {
      options[optName] = defaultOpts[optName];
    }
  }
  console.log('deepCopy options:', options);
  
  // options = options || defaultOpts;
  // if (typeof options.goDeep === 'undefined') {
  //   options.goDeep = defaultOpts.goDeep;
  // }
  // if (typeof options.includeNonEnumerable === 'undefined') {
  //   options.includeNonEnumerable = defaultOpts.includeNonEnumerable;
  // }
  // if (typeof options.maxDepth === 'undefined') {
  //   options.maxDepth = defaultOpts.maxDepth;
  // }

  // don't copy primitives
  if (!source || isPrimitive(source)) {
    return source;
  }

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
  copyObject(source, [dest, sourceType, 0, options]);
  return dest;
};

module.exports = deepCopy;
