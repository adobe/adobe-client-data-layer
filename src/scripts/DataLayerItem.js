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

/**
 * @typedef {String} DataLayer.Item.Type
 **/

/**
 * Enumeration of data layer item types.
 *
 * @enum {DataLayer.Item.Type}
 * @readonly
 */
const itemType = {
  DATA: 'data',
  EVENT: 'event',
  LISTENER_ON: 'listenerOn',
  LISTENER_OFF: 'listenerOff'
};

/**
 * Constraints for each type of the item configuration.
 */
const constraints = {
  data: {
    properties: [
      {
        key: 'data',
        type: 'object',
        mandatory: true
      }
    ],
    customPropertiesAllowed: false
  },
  event: {
    properties: [
      {
        key: 'event',
        type: 'string',
        mandatory: true
      },
      {
        key: 'info',
        type: 'object',
        mandatory: false
      },
      {
        key: 'data',
        type: 'object',
        mandatory: false
      }
    ],
    customPropertiesAllowed: false
  },
  listenerOn: {
    properties: [
      {
        key: 'on',
        type: 'string',
        mandatory: true
      },
      {
        key: 'handler',
        type: 'function',
        mandatory: true
      },
      {
        key: 'scope',
        type: 'string',
        values: ['past', 'future', 'all'],
        mandatory: false
      },
      {
        key: 'selector',
        type: 'string',
        mandatory: false
      }
    ],
    customPropertiesAllowed: false
  },
  listenerOff: {
    properties: [
      {
        key: 'off',
        type: 'string',
        mandatory: true
      },
      {
        key: 'handler',
        type: 'function',
        mandatory: false
      },
      {
        key: 'scope',
        type: 'string',
        values: ['past', 'future', 'all'],
        mandatory: false
      },
      {
        key: 'selector',
        type: 'string',
        mandatory: false
      }
    ],
    customPropertiesAllowed: false
  },
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
        type = itemType.DATA;
      } else if (utils.itemConfigMatchesConstraints(config, constraints.event)) {
        type = itemType.EVENT;
      } else if (utils.itemConfigMatchesConstraints(config, constraints.listenerOn)) {
        type = itemType.LISTENER_ON;
      } else if (utils.itemConfigMatchesConstraints(config, constraints.listenerOff)) {
        type = itemType.LISTENER_OFF;
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

  /**
   * Indicates whether the item is a data item.
   *
   * @returns {Boolean} true if the item is a data item, false otherwise.
   */
  get isData() {
    return this._type === itemType.DATA;
  };

  /**
   * Indicates whether the item is an event item.
   *
   * @returns {Boolean} true if the item is an event item, false otherwise.
   */
  get isEvent() {
    return this._type === itemType.EVENT;
  };

  /**
   * Indicates whether the item is a listener on item.
   *
   * @returns {Boolean} true if the item is a listener on item, false otherwise.
   */
  get isListenerOn() {
    return this._type === itemType.LISTENER_ON;
  };

  /**
   * Indicates whether the item is a listener off item.
   *
   * @returns {Boolean} true if the item is a listener off item, false otherwise.
   */
  get isListenerOff() {
    return this._type === itemType.LISTENER_OFF;
  };

  /**
   * Indicates whether the item is a listener on or off item.
   *
   * @returns {Boolean} true if the item is a listener on or off item, false otherwise.
   */
  get isListener() {
    return (this._type === itemType.LISTENER_ON || this._type === itemType.LISTENER_OFF);
  };

}

const utils = {
  /**
   * Determines whether the item configuration matches the constraints.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @param {Object} constraints The constraints on the item configuration.
   * @returns {Boolean} true if the item configuration matches the constraints, false otherwise.
   * @static
   */
  itemConfigMatchesConstraints: function(itemConfig, constraints) {
    for (let i = 0; i < constraints.properties.length; i++) {
      const key = constraints.properties[i].key;
      const type = constraints.properties[i].type;
      const values = constraints.properties[i].values;
      const mandatory = constraints.properties[i].mandatory;
      const configValue = itemConfig[key];
      const configValueType = typeof configValue;
      if (mandatory) {
        if (!configValue || (configValueType !== type) || !utils.valueIsAllowed(configValue, values)) {
          return false;
        }
      } else {
        if (configValue && ((configValueType !== type) || !utils.valueIsAllowed(configValue, values))) {
          return false;
        }
      }
    }
    return constraints.customPropertiesAllowed || !utils.itemConfigHasCustomProperties(itemConfig, constraints);
  },
  /**
   * Determines whether the item configuration has custom properties.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @param {Object} constraints The constraints on the item configuration.
   * @returns {Boolean} true if the item configuration has custom properties, false otherwise.
   * @static
   */
  itemConfigHasCustomProperties: function(itemConfig, constraints) {
    const itemConfigKeys = Object.keys(itemConfig);
    if (itemConfigKeys.length > constraints.properties.length) {
      return true;
    }
    for (let j = 0; j < itemConfigKeys.length; j++) {
      const itemConfigKey = itemConfigKeys[j];
      let itemConfigKeyMatchesConstraintKey = false;
      for (let k = 0; k < constraints.properties.length; k++) {
        const key = constraints.properties[k].key;
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
  },
  /**
   * Determines whether the value is allowed by the constraints.
   *
   * @param {String} value The value.
   * @param {Array} allowedValues The array of allowed values.
   * @returns {Boolean} true if the value is allowed by the constraints, false otherwise.
   * @static
   */
  valueIsAllowed: function(value, allowedValues) {
    if (!allowedValues) {
      return true;
    }
    for (let i = 0; i < allowedValues.length; i++) {
      const allowed = allowedValues[i];
      if (value === allowed) {
        return true;
      }
    }
    return false;
  }
};

module.exports = Item;
