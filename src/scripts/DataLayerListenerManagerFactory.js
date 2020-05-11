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

const cloneDeep = require('lodash/cloneDeep');
const get = require('lodash/get');
const has = require('lodash/has');
const isEqual = require('lodash/isEqual');
const omit = require('lodash/omit');

const constants = require('./DataLayerConstants');

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
  let _listeners = {};

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
     * @returns {Boolean} true if the listener was registered, false otherwise.
     */
    register: function(listener) {
      const event = listener.event;

      if (Object.prototype.hasOwnProperty.call(_listeners, event)) {
        if (_indexOf(listener) === -1) {
          _listeners[listener.event].push(listener);
          return true;
        }
      } else {
        _listeners[listener.event] = [listener];
        return true;
      }
      return false;
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
        if (!(listener.handler || listener.scope || listener.path)) {
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
            _callHandler(listener, item, false);
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
      _callHandler(listener, item, true);
    },

    // Resets the listeners based on the options of what to keep
    resetListeners: function(options) {
      const filteredListeners = {};
      if (options && options.keep && options.keep.events) {
        const events = options.keep.events;
        events.forEach(function(event) {
          if (_listeners[event]) {
            filteredListeners[event] = _listeners[event];
          }
        });
        _listeners = filteredListeners;
      } else if (options && options.remove && options.remove.events) {
        const events = options.remove.events;
        _listeners = omit(_listeners, events);
      }
    }
  };

  /**
   * Calls the listener handler on the item if a match is found.
   *
   * @param {Listener} listener The listener.
   * @param {Item} item The item.
   * @param {Boolean} isPastItem Flag indicating whether the item was registered before the listener.
   * @private
   */
  function _callHandler(listener, item, isPastItem) {
    if (_matches(listener, item)) {
      const itemConfig = item.config;
      const itemConfigCopy = cloneDeep(itemConfig);
      if (item.data) {
        if (listener.path) {
          const itemDataCopy = cloneDeep(item.data);
          const oldValue = get(dataLayerManager._previousStateCopy, listener.path);
          const newValue = get(itemDataCopy, listener.path);
          listener.handler.call(dataLayerManager._dataLayer, itemConfigCopy, oldValue, newValue);
        } else {
          if (isPastItem) {
            listener.handler.call(dataLayerManager._dataLayer, itemConfigCopy);
          } else {
            const oldState = dataLayerManager._previousStateCopy;
            const newState = cloneDeep(dataLayerManager._state);
            listener.handler.call(dataLayerManager._dataLayer, itemConfigCopy, oldState, newState);
          }
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
      if (item.data) {
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
      if (item.data && event === constants.dataLayerEvent.CHANGE) {
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
    if (item.data && listener.path) {
      return (has(item.data, listener.path) || _ancestorRemoved(item.data, listener.path));
    }

    return true;
  }

  /**
   * Checks if the object contains an ancestor that is set to null or undefined.
   *
   * @param {Object} object The object to check.
   * @param {String} path The path to check.
   * @returns {Boolean} true if the object contains an ancestor that is set to null or undefined, false otherwise.
   * @private
   */
  function _ancestorRemoved(object, path) {
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
        if (isEqual(registeredListener.handler, listener.handler)) {
          return index;
        }
      }
    }

    return -1;
  }

  return ListenerManager;
};

module.exports = ListenerManagerFactory;
