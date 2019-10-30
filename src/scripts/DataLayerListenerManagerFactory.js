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
const constants = require('./DataLayerConstants');
const has = require('lodash.has');
const get = require('lodash.get');
const isEqual = require('lodash.isequal');
const merge = require('lodash.merge');
const cloneDeep = require('lodash.clonedeep');

/**
 * Factory that creates a listener manager.
 *
 * @typedef ListenerManagerFactory
 */
const ListenerManagerFactory = {};

/**
 * Creates a listener manager.
 *
 * @param {Manager} dataLayerManager The data layer manager.
 * @returns {ListenerManager} A listener manager.
 */
ListenerManagerFactory.create = function(dataLayerManager) {
  const _listeners = {};

  /**
   * Listener Manager
   *
   * @typedef ListenerManager
   * @type {Object}
   */
  const ListenerManager = {
    /**
     * Registers a listener.
     *
     * @function
     * @param {Listener} listener The listener to register.
     */
    register: function(listener) {
      const event = listener.event;

      if (Object.prototype.hasOwnProperty.call(_listeners, event)) {
        if (_indexOf(listener) === -1) {
          _listeners[listener.event].push(listener);
        }
      } else {
        _listeners[listener.event] = [listener];
      }
    },
    /**
     * Unregisters a listener.
     *
     * @function
     * @param {Listener} listener The listener to unregister.
     */
    unregister: function(listener) {
      const event = listener.event;

      if (Object.prototype.hasOwnProperty.call(_listeners, event)) {
        if (!(listener.handler || listener.scope || listener.selector)) {
          _listeners[event] = [];
        } else {
          const index = _indexOf(listener);
          if (index > -1) {
            _listeners[event].splice(index, 1);
          }
        }
      }
    },
    /**
     * Triggers listeners related to the passed item.
     *
     * @function
     * @param {Item} item Item to trigger listener for.
     */
    triggerListeners: function(item) {
      const triggeredEvents = _getTriggeredEvents(item);
      triggeredEvents.forEach(function(event) {
        if (Object.prototype.hasOwnProperty.call(_listeners, event)) {
          for (const listener of _listeners[event]) {
            _callHandler(listener, item);
          }
        }
      });
    },
    /**
     * Triggers a single listener on the passed item.
     *
     * @function
     * @param {Listener} listener Listener to call.
     * @param {Item} item Item to call the listener with.
     */
    triggerListener: function(listener, item) {
      _callHandler(listener, item);
    }
  };

  /**
   * Calls the listener handler on the item if a match is found.
   *
   * @param {Listener} listener The listener.
   * @param {Item} item The item.
   * @private
   */
  function _callHandler(listener, item) {
    if (_matches(listener, item)) {
      const itemConfig = item.config;
      const itemConfigCopy = merge({}, itemConfig);
      if (item.config.data) {
        if (listener.selector) {
          const oldValue = cloneDeep(get(dataLayerManager._state, listener.selector));
          const newValue = cloneDeep(get(itemConfig.data, listener.selector));
          listener.handler.call(dataLayerManager._dataLayer, itemConfigCopy, oldValue, newValue);
        } else {
          const oldState = merge({}, dataLayerManager._state);
          const newState = merge({}, oldState, item.config.data);
          listener.handler.call(dataLayerManager._dataLayer, itemConfigCopy, oldState, newState);
        }
      } else {
        listener.handler.call(dataLayerManager._dataLayer, itemConfigCopy);
      }
    }
  }

  /**
   * Returns the names of the events that are triggered for this item.
   *
   * @param {Item} item The item.
   * @returns {Array<String>} The names of the events that are triggered for this item.
   * @private
   */
  function _getTriggeredEvents(item) {
    const triggeredEvents = [];
    const itemConfig = item.config;
    if (item.type === constants.itemType.DATA) {
      triggeredEvents.push(constants.dataLayerEvent.CHANGE);
    } else if (item.type === constants.itemType.EVENT) {
      if (itemConfig.event !== constants.dataLayerEvent.CHANGE) {
        triggeredEvents.push(itemConfig.event);
      }
      triggeredEvents.push(constants.dataLayerEvent.EVENT);
      if (itemConfig.data) {
        triggeredEvents.push(constants.dataLayerEvent.CHANGE);
      }
    }
    return triggeredEvents;
  }

  /**
   * Checks if the listener matches the item.
   *
   * @param {Listener} listener The listener.
   * @param {Item} item The item.
   * @returns {Boolean} true if listener matches the item, false otherwise.
   * @private
   */
  function _matches(listener, item) {
    const event = listener.event;
    const itemConfig = item.config;
    let matches = false;

    if (item.type === constants.itemType.DATA) {
      if (event === constants.dataLayerEvent.CHANGE) {
        matches = _selectorMatches(listener, item);
      }
    } else if (item.type === constants.itemType.EVENT) {
      if (event === constants.dataLayerEvent.EVENT || event === itemConfig.event) {
        matches = _selectorMatches(listener, item);
      }
      if (itemConfig.data && event === constants.dataLayerEvent.CHANGE) {
        matches = _selectorMatches(listener, item);
      }
    }

    return matches;
  }

  /**
   * Checks if a listener has a selector that points to an object in the data payload of an item.
   *
   * @param {Listener} listener The listener to extract the selector from.
   * @param {Item} item The item.
   * @returns {Boolean} true if a selector is not provided or if the given selector is matching, false otherwise.
   * @private
   */
  function _selectorMatches(listener, item) {
    const itemConfig = item.config;

    if (listener.selector && itemConfig.data) {
      return has(itemConfig.data, listener.selector);
    }

    return true;
  }

  /**
   * Returns the index of a listener in the registry, or -1 if not present.
   *
   * @param {Listener} listener The listener to locate.
   * @returns {Number} The index of the listener in the registry, or -1 if not present.
   * @private
   */
  function _indexOf(listener) {
    const event = listener.event;

    if (Object.prototype.hasOwnProperty.call(_listeners, event)) {
      for (const [index, registeredListener] of _listeners[event].entries()) {
        if (isEqual(registeredListener, listener)) {
          return index;
        }
      }
    }

    return -1;
  }

  return ListenerManager;
};

module.exports = ListenerManagerFactory;
