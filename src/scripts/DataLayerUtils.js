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
    const keys = Object.keys(itemConfig);
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
    const keys = Object.keys(itemConfig);
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
    const keys = Object.keys(itemConfig);
    return (keys.length === 1 && itemConfig.off) ||
      (keys.length === 2 && itemConfig.off && itemConfig.handler) ||
      (keys.length === 3 && itemConfig.off && itemConfig.handler && (itemConfig.scope || itemConfig.selector)) ||
      (keys.length === 4 && itemConfig.off && itemConfig.handler && itemConfig.scope && itemConfig.selector);
  }
};

module.exports = utils;
