"use strict";

const [ isPrimitive, objectType, objectBehaviors] =
  require('./object-library.js');

/**
 * return a deep copy of the source
 * @param {Date|[]|{}} source
 * @param {Boolean=true} options.goDeep - perform deep copy
 * @param {Boolean=false} options.includeNonEnumerable - copy non-enumerables
 * @return {*}
 */
module.exports = function deepCopy (source,
  options) {
  const {
    goDeep: goDeep,
    includeNonEnumerable: includeNonEnumerable
  } =
  options || {
    goDeep: true,
    includeNonEnumerable: false
  }

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

