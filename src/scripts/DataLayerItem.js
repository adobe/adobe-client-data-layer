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
/* eslint no-console: "off" */
/* eslint no-unused-vars: "off" */
'use strict';
var DataLayer = {};

/**
 * @typedef {String} DataLayer.Item.Type
 **/

/**
 * Enumeration of data layer item types.
 *
 * @enum {DataLayer.Item.Type}
 * @readonly
 */
var itemType = {
  DATA: 'data',
  EVENT: 'event',
  LISTENER_ON: 'listenerOn',
  LISTENER_OFF: 'listenerOff'
};

/**
 * DataLayer.Item
 *
 * @class DataLayer.Item
 * @classdesc A data layer item.
 * @param {ItemConfig} itemConfig The data layer item configuration.
 * @param {Number} idx The item index in the array of existing items.
 */
DataLayer.Item = function DataLayer(itemConfig, idx) {
  var that = this;
  that._config = itemConfig;
  that._index = idx;
  that._type = (function(config) {
    var type;
    if (that.utils.isDataConfig(config)) {
      type = itemType.DATA;
    } else if (that.utils.isEventConfig(config)) {
      type = itemType.EVENT;
    } else if (that.utils.isListenerOnConfig(config)) {
      type = itemType.LISTENER_ON;
    } else if (that.utils.isListenerOffConfig(config)) {
      type = itemType.LISTENER_OFF;
    }
    return type;
  }(itemConfig));

  that._valid = !!that._type;
};

/**
 * Returns the index of the item in the array of existing items (added with the standard Array.prototype.push())
 *
 * @returns {Number} The index of the item in the array of existing items if it exists, -1 otherwise.
 */
DataLayer.Item.prototype.getIndex = function() {
  return this._index;
};

/**
 * Indicates whether this is a valid item.
 *
 * @returns {Boolean} true if the item is valid, false otherwise.
 */
DataLayer.Item.prototype.isValid = function() {
  return this._valid;
};

/**
 * Retrieves the item type.
 *
 * @returns {itemType} The item type.
 */
DataLayer.Item.prototype.getType = function() {
  return this._type;
};

/**
 * Retrieves the item configuration.
 *
 * @returns {ItemConfig} The item configuration.
 */
DataLayer.Item.prototype.getConfig = function() {
  return this._config;
};

/**
 * Data layer item utilities.
 *
 * @type {Object}
 */
DataLayer.Item.prototype.utils = {
  /**
   * Determines whether the passed item configuration is a data configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is a data configuration, false otherwise.
   * @static
   */
  isDataConfig: function(itemConfig) {
    if (!itemConfig) {
      return false;
    }
    return (Object.keys(itemConfig).length === 1 && itemConfig.data);
  },
  /**
   * Determines whether the passed item configuration is an event configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is an event configuration, false otherwise.
   * @static
   */
  isEventConfig: function(itemConfig) {
    if (!itemConfig) {
      return false;
    }
    var keys = Object.keys(itemConfig);
    return (keys.length === 1 && itemConfig.event) ||
      (keys.length === 2 && itemConfig.event && (itemConfig.info || itemConfig.data)) ||
      (keys.length === 3 && itemConfig.event && itemConfig.info && itemConfig.data);
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
    if (!itemConfig) {
      return false;
    }
    var keys = Object.keys(itemConfig);
    return (keys.length === 2 && itemConfig.on && itemConfig.handler) ||
      (keys.length === 3 && itemConfig.on && itemConfig.handler && (itemConfig.scope || itemConfig.selector)) ||
      (keys.length === 4 && itemConfig.on && itemConfig.handler && itemConfig.scope && itemConfig.selector);
  },
  /**
   * Determines whether the passed item configuration is a listener off configuration.
   *
   * @param {ItemConfig} itemConfig The item configuration.
   * @returns {Boolean} true if the item configuration is a listener off configuration, false otherwise.
   * @static
   */
  isListenerOffConfig: function(itemConfig) {
    if (!itemConfig) {
      return false;
    }
    var keys = Object.keys(itemConfig);
    return (keys.length === 1 && itemConfig.off) ||
      (keys.length === 2 && itemConfig.off && itemConfig.handler) ||
      (keys.length === 3 && itemConfig.off && itemConfig.handler && (itemConfig.scope || itemConfig.selector)) ||
      (keys.length === 4 && itemConfig.off && itemConfig.handler && itemConfig.scope && itemConfig.selector);
  }
};

module.exports = DataLayer.Item;
