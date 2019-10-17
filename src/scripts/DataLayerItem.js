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
const utils = require('./DataLayerUtils');

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

const events = {
  /** Represents an event triggered for any change in the data layer state */
  CHANGE: 'datalayer:change',
  /** Represents an event triggered for any event push to the data layer */
  EVENT: 'datalayer:event',
  /** Represents an event triggered when the data layer has initialized */
  READY: 'datalayer:ready'
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
    that._eventNames = [];
    that._config = itemConfig;
    that._index = index;
    if (utils.isDataConfig(itemConfig)) {
      that._type = itemType.DATA;
      that._eventNames.push(events.CHANGE);
    } else if (utils.isEventConfig(itemConfig)) {
      that._type = itemType.EVENT;
      that._eventNames.push(events.EVENT);
      that._eventNames.push(itemConfig.event);
      if (itemConfig.data) {
        that._eventNames.push(events.CHANGE);
      }
    } else if (utils.isListenerOnConfig(itemConfig)) {
      that._type = itemType.LISTENER_ON;
    } else if (utils.isListenerOffConfig(itemConfig)) {
      that._type = itemType.LISTENER_OFF;
    }
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
   * Returns the names of the events that this item can be listened to.
   *
   * @returns {Array} The names of the events that this item can be listened to.
   */
  get eventNames() {
    return this._eventNames;
  };
}

module.exports = Item;
