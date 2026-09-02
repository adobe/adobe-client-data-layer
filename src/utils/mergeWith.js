
function mergeWith(target, source, customizer) {
  if (!source || !target) {
    return;
  }

  Object.keys(source).forEach(key => {
    let newValue = customizer ? customizer(target[key], source[key], key, target) : undefined;

    if (newValue === undefined) {
      if (source[key] === Object(source[key]) && key in target && !Array.isArray(source[key])) {
        newValue = mergeWith(target[key], source[key], customizer);
      } else {
        newValue = source[key];
      }
    }
    target[key] = newValue;
  });

  return target;
}

/**
 * Fix: got rid of some no longer needed code.  structuredClone(target) by itself handles everything we need whenever the customizer doesn't provide a result
 */
function cloneDeepWith(target, customizer) {
  let newTarget = customizer ? customizer(target) : undefined;
  if (newTarget === undefined) {
    newTarget = structuredClone(target);
  }
  return newTarget;
}

module.exports = {
  mergeWith,
  cloneDeepWith
};
