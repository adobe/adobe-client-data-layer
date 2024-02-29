
function mergeWith(target, source, customizer) {
  if (!source) {
    return;
  }
  if (!target) {
    target = {};
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

function cloneDeepWith(target, customizer) {
  let newTarget = customizer ? customizer(target) : undefined;

  if (newTarget === undefined) {
    if (target === Object(target) && !Array.isArray(target)) {
      newTarget = {};
      const keys = Object.keys(target);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        newTarget[key] = cloneDeepWith(target[key], customizer);
      };
    }
    newTarget = structuredClone(target);
  }

  return newTarget;
}

module.exports = {
  mergeWith,
  cloneDeepWith
};
