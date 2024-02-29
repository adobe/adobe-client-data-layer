function get(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    result = result[key];

    if (result === undefined) {
      return defaultValue;
    }
  }

  return result;
}

function has(obj, path) {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    /* eslint-disable no-prototype-builtins */
    if (!result?.hasOwnProperty(key)) {
      return false;
    }
    result = result[key];
  }

  return true;
}

module.exports = {
  get,
  has
};
