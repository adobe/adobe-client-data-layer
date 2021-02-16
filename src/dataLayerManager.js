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

const _ = require('../custom-lodash');
const version = require('../version.json').version;
const cloneDeep = _.cloneDeep;
const get = _.get;

const Item = require('./item');
const Listener = require('./listener');
const ListenerManager = require('./listenerManager');
const CONSTANTS = require('./constants');
const customMerge = require('./utils/customMerge');

/**
 * Manager
 *
 * @class Manager
 * @classdesc Data Layer manager that augments the passed data layer array and handles eventing.
 * @param {Object} config The Data Layer manager configuration.
 */
module.exports = function(config) {
  const _config = config || {};
  let _dataLayer = [];
  let _preLoadedItems = [];
  let _state = {};
  let _listenerManager;

  const DataLayerManager = {
    getState: function() {
      return _state;
    },
    getDataLayer: function() {
      return _dataLayer;
    }
  };

  _initialize();
  _augment();
  _processItems();

  /**
   * Initializes the data layer.
   *
   * @private
   */
  function _initialize() {
    if (!Array.isArray(_config.dataLayer)) {
      _config.dataLayer = [];
    }

    // Remove preloaded items from the data layer array and add those to the array of preloaded items
    _preLoadedItems = _config.dataLayer.splice(0, _config.dataLayer.length);
    _dataLayer = _config.dataLayer;
    _dataLayer.version = version;
    _state = {};
    _listenerManager = ListenerManager(DataLayerManager);
  };

  /**
   * Updates the state with the item.
   *
   * @param {Item} item The item.
   * @private
   */
  function _updateState(item) {
    _state = customMerge(_state, item.data);
  };

  /**
   * Augments the data layer Array Object, overriding: push() and adding getState(), addEventListener and removeEventListener.
   *
   * @private
   */
  function _augment() {
    /**
     * Pushes one or more items to the data layer.
     *
     * @param {...ItemConfig} var_args The items to add to the data layer.
     * @returns {Number} The length of the data layer following push.
     */
    _dataLayer.push = function(var_args) { /* eslint-disable-line camelcase */
      const pushArguments = arguments;
      const filteredArguments = arguments;

      Object.keys(pushArguments).forEach(function(key) {
        const itemConfig = pushArguments[key];
        const item = Item(itemConfig);

        if (!item.valid) {
          _logInvalidItemError(item);
          delete filteredArguments[key];
        }
        switch (item.type) {
          case CONSTANTS.itemType.DATA:
          case CONSTANTS.itemType.EVENT: {
            _processItem(item);
            break;
          }
          case CONSTANTS.itemType.FCTN: {
            delete filteredArguments[key];
            _processItem(item);
            break;
          }
          case CONSTANTS.itemType.LISTENER_ON:
          case CONSTANTS.itemType.LISTENER_OFF: {
            delete filteredArguments[key];
          }
        }
      });

      if (filteredArguments[0]) {
        return Array.prototype.push.apply(this, filteredArguments);
      }
    };

    /**
     * Returns a deep copy of the data layer state or of the object defined by the path.
     *
     * @param {Array|String} path The path of the property to get.
     * @returns {*} Returns a deep copy of the resolved value if a path is passed, a deep copy of the data layer state otherwise.
     */
    _dataLayer.getState = function(path) {
      if (path) {
        return get(cloneDeep(_state), path);
      }
      return cloneDeep(_state);
    };

    /**
     * Event listener callback.
     *
     * @callback eventListenerCallback A function that is called when the event of the specified type occurs.
     * @this {DataLayer}
     * @param {Object} event The event object pushed to the data layer that triggered the callback.
     */

    /**
     * Sets up a function that will be called whenever the specified event is triggered.
     *
     * @param {String} type A case-sensitive string representing the event type to listen for.
     * @param {eventListenerCallback} callback A function that is called when the event of the specified type occurs.
     * @param {Object} [options] Optional characteristics of the event listener.
     * @param {String} [options.path] The path in the state object to filter the listening to.
     * @param {('past'|'future'|'all')} [options.scope] The timing to filter the listening to:
     *      - {String} past The listener is triggered for past events only.
     *      - {String} future The listener is triggered for future events only.
     *      - {String} all The listener is triggered for both past and future events (default value).
     */
    _dataLayer.addEventListener = function(type, callback, options) {
      const eventListenerItem = Item({
        on: type,
        handler: callback,
        scope: options && options.scope,
        path: options && options.path
      });

      _processItem(eventListenerItem);
    };

    /**
     * Removes an event listener previously registered with addEventListener().
     *
     * @param {String} type A case-sensitive string representing the event type to listen for.
     * @param {Function} [listener] Optional function that is to be removed.
     */
    _dataLayer.removeEventListener = function(type, listener) {
      const eventListenerItem = Item({
        off: type,
        handler: listener
      });

      _processItem(eventListenerItem);
    };
  };

  /**
   * Processes all items that already exist on the stack.
   *
   * @private
   */
  function _processItems() {
    for (let i = 0; i < _preLoadedItems.length; i++) {
      _dataLayer.push(_preLoadedItems[i]);
    }
  };

  /**
   * Processes an item pushed to the stack.
   *
   * @param {Item} item The item to process.
   * @private
   */
  function _processItem(item) {
    if (!item.valid) {
      _logInvalidItemError(item);
      return;
    }

    /**
     * Returns all items before the provided one.
     *
     * @param {Item} item The item.
     * @returns {Array<Item>} The items before.
     * @private
     */
    function _getBefore(item) {
      if (!(_dataLayer.length === 0 || item.index > _dataLayer.length - 1)) {
        return _dataLayer.slice(0, item.index).map(itemConfig => Item(itemConfig));
      }
      return [];
    }

    const typeProcessors = {
      data: function(item) {
        _updateState(item);
        _listenerManager.triggerListeners(item);
      },
      fctn: function(item) {
        item.config.call(_dataLayer, _dataLayer);
      },
      event: function(item) {
        if (item.data) {
          _updateState(item);
        }
        _listenerManager.triggerListeners(item);
      },
      listenerOn: function(item) {
        const listener = Listener(item);
        switch (listener.scope) {
          case CONSTANTS.listenerScope.PAST: {
            for (const registeredItem of _getBefore(item)) {
              _listenerManager.triggerListener(listener, registeredItem);
            }
            break;
          }
          case CONSTANTS.listenerScope.FUTURE: {
            _listenerManager.register(listener);
            break;
          }
          case CONSTANTS.listenerScope.ALL: {
            const registered = _listenerManager.register(listener);
            if (registered) {
              for (const registeredItem of _getBefore(item)) {
                _listenerManager.triggerListener(listener, registeredItem);
              }
            }
          }
        }
      },
      listenerOff: function(item) {
        _listenerManager.unregister(Listener(item));
      }
    };

    typeProcessors[item.type](item);
  };

  /**
   * Logs error for invalid item pushed to the data layer.
   *
   * @param {Item} item The invalid item.
   * @private
   */
  function _logInvalidItemError(item) {
    const message = 'The following item cannot be handled by the data layer ' +
      'because it does not have a valid format: ' +
      JSON.stringify(item.config);
    console.error(message);
  };

  return DataLayerManager;
};
