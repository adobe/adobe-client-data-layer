/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const _ = require('../../custom-lodash');
const has = _.has;
const get = _.get;

/**
  * Checks if the object contains an ancestor that is set to null or undefined.
  *
  * @param {Object} object The object to check.
  * @param {String} path The path to check.
  * @returns {Boolean} true if the object contains an ancestor that is set to null or undefined, false otherwise.
  * @private
  */
module.exports = function(object, path) {
  let ancestorPath = path.substring(0, path.lastIndexOf('.'));
  while (ancestorPath) {
    if (has(object, ancestorPath)) {
      const ancestorValue = get(object, ancestorPath);
      if (ancestorValue === null || ancestorValue === undefined) {
        return true;
      }
    }
    ancestorPath = ancestorPath.substring(0, ancestorPath.lastIndexOf('.'));
  }

  return false;
};
