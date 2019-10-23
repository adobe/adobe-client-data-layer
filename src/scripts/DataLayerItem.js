/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const DataLayer = {};
DataLayer.constants = require('./DataLayerConstants');
/**
 * Constraints for each type of the item configuration.
 */
const constraints = {
  data: {
    properties: {
      data: {
        type: 'object'
      }
    }
  },
  event: {
    properties: {
      event: {
        type: 'string'
      },
      info: {
        type: 'object',
        optional: true
      },
      data: {
        type: 'object',
        optional: true
      }
    }
  },
  listenerOn: {
    properties: {
      on: {
        type: 'string'
      },
      handler: {
        type: 'function'
      },
      scope: {
        type: 'string',
        values: ['past', 'future', 'all'],
        optional: true
      },
      selector: {
        type: 'string',
        optional: true
      }
    }
  },
  listenerOff: {
    properties: {
      off: {
        type: 'string'
      },
      handler: {
        type: 'function',
        optional: true
      },
      scope: {
        type: 'string',
        values: ['past', 'future', 'all'],
        optional: true
      },
      selector: {
        type: 'string',
        optional: true
      }
    }
  }
};

/**
 * A data layer item.
 *
 * @class Item
 * @classdesc A data layer item.
 */
class Item {
  /**
   * Constructs a data layer item.
   *
   * @param {ItemConfig} itemConfig The data layer item configuration.
   * @param {Number} index The item index in the array of existing items.
   */
  constructor(itemConfig, index) {
    const that = this;
    that._config = itemConfig;
    that._type = (function(config) {
      let type;
      if (utils.itemConfigMatchesConstraints(config, constraints.data)) {
        type = DataLayer.constants.itemType.DATA;
      } else if (utils.itemConfigMatchesConstraints(config, constraints.event)) {
        type = DataLayer.constants.itemType.EVENT;
      } else if (utils.itemConfigMatchesConstraints(config, constraints.listenerOn)) {
        type = DataLayer.constants.itemType.LISTENER_ON;
      } else if (utils.itemConfigMatchesConstraints(config, constraints.listenerOff)) {
        type = DataLayer.constants.itemType.LISTENER_OFF;
      }
      return type;
    }(itemConfig));
    that._index = index;
    that._valid = !!that._type;
  }

  /**
   * Returns the item configuration.
   *
   * @returns {ItemConfig} The item configuration.
   */
  get config() {
    return this._config;
  };

  /**
   * Returns the item type.
   *
   * @returns {itemType} The item type.
   */
  get type() {
    return this._type;
  };

  /**
   * Indicates whether the item is valid.
   *
   * @returns {Boolean} true if the item is valid, false otherwise.
   */
  get valid() {
    return this._valid;
  };

  /**
   * Returns the index of the item in the array of existing items (added with the standard Array.prototype.push())
   *
   * @returns {Number} The index of the item in the array of existing items if it exists, -1 otherwise.
   */
  get index() {
    return this._index;
  };
}

const utils = {
  /**
   * Determines whether the item configuration matches the constraints.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @param {Object} itemConstraints The constraints on the item configuration.
   * @returns {Boolean} true if the item configuration matches the constraints, false otherwise.
   * @static
   */
  itemConfigMatchesConstraints: function(itemConfig, itemConstraints) {
    const keys = Object.keys(itemConstraints.properties);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const type = itemConstraints.properties[key].type;
      const supportedValues = itemConstraints.properties[key].values;
      const mandatory = !itemConstraints.properties[key].optional;
      const configValue = itemConfig[key];
      const configValueType = typeof configValue;
      if (mandatory) {
        if (!configValue || (configValueType !== type) || (supportedValues && !supportedValues.includes(configValue))) {
          return false;
        }
      } else {
        if (configValue && ((configValueType !== type) || (supportedValues && !supportedValues.includes(configValue)))) {
          return false;
        }
      }
    }
    return !utils.itemConfigHasCustomProperties(itemConfig, itemConstraints);
  },
  /**
   * Determines whether the item configuration has custom properties.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @param {Object} itemConstraints The constraints on the item configuration.
   * @returns {Boolean} true if the item configuration has custom properties, false otherwise.
   * @static
   */
  itemConfigHasCustomProperties: function(itemConfig, itemConstraints) {
    const itemConfigKeys = Object.keys(itemConfig);
    const itemConstraintsKeys = Object.keys(itemConstraints.properties);
    if (itemConfigKeys.length > itemConstraintsKeys.length) {
      return true;
    }
    for (let j = 0; j < itemConfigKeys.length; j++) {
      const itemConfigKey = itemConfigKeys[j];
      let itemConfigKeyMatchesConstraintKey = false;
      for (let k = 0; k < itemConstraintsKeys.length; k++) {
        const key = itemConstraintsKeys[k];
        if (itemConfigKey === key) {
          itemConfigKeyMatchesConstraintKey = true;
          break;
        }
      }
      if (!itemConfigKeyMatchesConstraintKey) {
        return true;
      }
    }
    return false;
  }
};

module.exports = {
  item: Item,
  utils: utils
};
