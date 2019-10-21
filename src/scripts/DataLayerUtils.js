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
const utils = {
  /**
   * Deep merges a source and target object.
   *
   * @param {Object} target The target object.
   * @param {Object} source The source object.
   * @static
   */
  deepMerge: function(target, source) {
    const tmpSource = {};
    const that = this;
    if (that.isObject(target) && that.isObject(source)) {
      Object.keys(source).forEach(function(key) {
        if (that.isObject(source[key])) {
          if (!target[key]) {
            tmpSource[key] = {};
            Object.assign(target, tmpSource);
          }
          that.deepMerge(target[key], source[key]);
        } else {
          if (source[key] === undefined) {
            delete target[key];
          } else {
            tmpSource[key] = source[key];
            Object.assign(target, tmpSource);
          }
        }
      });
    }
  },
  /**
   * Checks whether the passed object is an object.
   *
   * @param {Object} obj The object that will be checked.
   * @returns {Boolean} true if it is an object, false otherwise.
   * @static
   */
  isObject: function(obj) {
    return (obj && typeof obj === 'object' && !Array.isArray(obj));
  },
  /**
   * Determines whether the passed item configuration is a data configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is a data configuration, false otherwise.
   * @static
   */
  isDataConfig: function(itemConfig) {
    const constraints = {
      properties: [
        {
          key: 'data',
          type: 'object',
          mandatory: true
        }
      ],
      customPropertiesAllowed: false
    };
    return utils.itemConfigMatchesConstraints(itemConfig, constraints);
  },
  /**
   * Determines whether the passed item configuration is an event configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is an event configuration, false otherwise.
   * @static
   */
  isEventConfig: function(itemConfig) {
    const constraints = {
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
    };
    return utils.itemConfigMatchesConstraints(itemConfig, constraints);
  },
  /**
   * Determines whether the passed item is a listener configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item is a listener on or listener off configuration, false otherwise.
   * @static
   */
  isListenerConfig: function(itemConfig) {
    return this.isListenerOnConfig(itemConfig) || this.isListenerOffConfig(itemConfig);
  },
  /**
   * Determines whether the passed item configuration is a listener on configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is a listener on configuration, false otherwise.
   * @static
   */
  isListenerOnConfig: function(itemConfig) {
    const constraints = {
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
    };
    return utils.itemConfigMatchesConstraints(itemConfig, constraints);
  },
  /**
   * Determines whether the passed item configuration is a listener off configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is a listener off configuration, false otherwise.
   * @static
   */
  isListenerOffConfig: function(itemConfig) {
    const constraints = {
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
    };
    return utils.itemConfigMatchesConstraints(itemConfig, constraints);
  },
  /**
   * Determines whether the item configuration matches the constraints.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @param {Object} constraints The constraints on the item configuration.
   * @returns {Boolean} true if the item configuration matches the constraints, false otherwise.
   * @static
   */
  itemConfigMatchesConstraints: function(itemConfig, constraints) {
    if (!itemConfig) {
      return false;
    }
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

module.exports = utils;
