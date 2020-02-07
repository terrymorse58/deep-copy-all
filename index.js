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

