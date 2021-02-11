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
const cloneDeep = _.cloneDeep;

const constants = require('./constants');
const listenerMatch = require('./utils/listenerMatch');
const indexOfListener = require('./utils/indexOfListener');

/**
 * Creates a listener manager.
 *
 * @param {Manager} dataLayerManager The data layer manager.
 * @returns {ListenerManager} A listener manager.
 */
module.exports = function(dataLayerManager) {
  const _listeners = {};
  const _dataLayerManager = dataLayerManager;

  /**
   * Find index of listener in listeners object.
   */
  const _indexOfListener = indexOfListener.bind(null, _listeners);

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
        if (_indexOfListener(listener) === -1) {
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
          const index = _indexOfListener(listener);
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
    if (listenerMatch(listener, item)) {
      const callbackArgs = [cloneDeep(item.config)];
      listener.handler.apply(_dataLayerManager.getDataLayer(), callbackArgs);
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

    switch (item.type) {
      case constants.itemType.DATA: {
        triggeredEvents.push(constants.dataLayerEvent.CHANGE);
        break;
      }
      case constants.itemType.EVENT: {
        triggeredEvents.push(constants.dataLayerEvent.EVENT);
        if (item.data) triggeredEvents.push(constants.dataLayerEvent.CHANGE);
        if (item.config.event !== constants.dataLayerEvent.CHANGE) {
          triggeredEvents.push(item.config.event);
        }
        break;
      }
    }
    return triggeredEvents;
  }

  return ListenerManager;
};
