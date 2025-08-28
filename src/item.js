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

const dataMatchesContraints = require('./utils/dataMatchesContraints');
const ITEM_CONSTRAINTS = require('./itemConstraints');
const CONSTANTS = require('./constants');

const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

/**
 * Constructs a data layer item.
 *
 * @param {ItemConfig} itemConfig The data layer item configuration.
 * @param {Number} index The item index in the array of existing items.
 */

module.exports = function(itemConfig, index) {
  const _config = itemConfig;
  const _index = index;
  const _type = getType();
  const _data = getData();
  const _valid = !!_type;

  function getType() {
    return Object.keys(ITEM_CONSTRAINTS).find(key => dataMatchesContraints(_config, ITEM_CONSTRAINTS[key])) ||
      (typeof _config === 'function' && CONSTANTS.itemType.FCTN) ||
      (isPlainObject(_config) && CONSTANTS.itemType.DATA);
  }

  function getData() {
    const data = Object.keys(_config)
      .filter(key => !Object.keys(ITEM_CONSTRAINTS.event).includes(key))
      .reduce((obj, key) => {
        obj[key] = _config[key];
        return obj;
      }, {});
    if (!isEmpty(data)) {
      return data;
    }
  }

  return {
    /**
     * Returns the item configuration.
     *
     * @returns {ItemConfig} The item configuration.
     */
    config: _config,

    /**
     * Returns the item type.
     *
     * @returns {itemType} The item type.
     */
    type: _type,

    /**
     * Returns the item data.
     *
     * @returns {DataConfig} The item data.
     */
    data: _data,

    /**
     * Indicates whether the item is valid.
     *
     * @returns {Boolean} true if the item is valid, false otherwise.
     */
    valid: _valid,

    /**
     * Returns the index of the item in the array of existing items (added with the standard Array.prototype.push())
     *
     * @returns {Number} The index of the item in the array of existing items if it exists, -1 otherwise.
     */
    index: _index
  };
};
