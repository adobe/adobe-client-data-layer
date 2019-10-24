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
const isEqual = require('lodash.isequal');

const ListenerManager = function() {
  const that = {};
  const _listeners = {};

  /**
   * Registers a listener based on a listener on configuration.
   *
   * @param {DataLayer.Item} listenerOn The listener on.
   */
  that.registerListener = function(listenerOn) {
    const eventName = listenerOn.config.on;
    if (!_isRegisteredListener(listenerOn)) {
      if (!_listeners[eventName]) {
        _listeners[eventName] = [];
      }
      _listeners[eventName].push(listenerOn);

      console.debug('listener registered on: ', eventName);
    }
  };

  /**
   * Unregisters a listener.
   *
   * @param {DataLayer.Item} listenerOff The listener off.
   */
  that.unregisterListener = function(listenerOff) {
    const indexes = _getListenersMatchingListenerOff(listenerOff);
    const eventName = listenerOff.config.off;
    for (let i = indexes.length - 1; i > -1; i--) {
      if (indexes[i] > -1) {
        _listeners[eventName].splice(indexes[i], 1);

        console.debug('listener unregistered on: ', eventName);
      }
    }
  };

  /**
   * Triggers all the registered listeners matching the item.
   *
   * @param {DataLayer.Item} item The item.
   */
  that.triggerListeners = function(item) {
    const triggeredEvents = _getTriggeredEvents(item);
    triggeredEvents.forEach(function(eventName) {
      if (_listeners[eventName]) {
        _listeners[eventName].forEach(function(listener) {
          that.callListenerHandler(listener, item);
        });
      }
    });
  };

  /**
   * Calls the listener on the item if a match is found.
   *
   * @param {DataLayer.Item} listener The listener.
   * @param {DataLayer.Item} item The item.
   */
  that.callListenerHandler = function(listener, item) {
    if (_isMatching(listener, item)) {
      const listenerConfig = listener.config;
      const itemConfig = item.config;
      const itemConfigCopy = JSON.parse(JSON.stringify(itemConfig));
      listenerConfig.handler(itemConfigCopy);
    }
  };

  /**
   * Returns the names of the events that are triggered for this item.
   *
   * @param {DataLayer.Item} item The item.
   * @returns {Array} An array with the names of the events that are triggered for this item.
   * @private
   */
  function _getTriggeredEvents(item) {
    const triggeredEvents = [];
    const itemConfig = item.config;
    if (item.type === constants.itemType.DATA) {
      triggeredEvents.push(constants.event.CHANGE);
    } else if (item.type === constants.itemType.EVENT) {
      if (itemConfig.event !== constants.event.CHANGE) {
        triggeredEvents.push(itemConfig.event);
      }
      triggeredEvents.push(constants.event.EVENT);
      if (itemConfig.data) {
        triggeredEvents.push(constants.event.CHANGE);
      }
    }
    return triggeredEvents;
  }

  /**
   * Checks if the listener matches the item.
   *
   * @param {DataLayer.Item} listener The listener.
   * @param {DataLayer.Item} item The item.
   * @returns {Boolean} true if listener matches the item, false otherwise.
   * @private
   */
  function _isMatching(listener, item) {
    const listenerConfig = listener.config;
    const itemConfig = item.config;
    let isMatching = false;

    if (item.type === constants.itemType.DATA) {
      if (listenerConfig.on === constants.event.CHANGE) {
        isMatching = _isSelectorMatching(listenerConfig, item);
      }
    } else if (item.type === constants.itemType.EVENT) {
      if (listenerConfig.on === constants.event.EVENT ||
        listenerConfig.on === itemConfig.event) {
        isMatching = _isSelectorMatching(listenerConfig, item);
      }
      if (itemConfig.data &&
        listenerConfig.on === constants.event.CHANGE) {
        isMatching = _isSelectorMatching(listenerConfig, item);
      }
    }
    return isMatching;
  }

  /**
   * Returns the indexes of the registered listeners that match the listener off.
   *
   * @param {DataLayer.Item} listenerOff The listener off.
   * @returns {Array} The indexes of the matching listeners.
   * @private
   */
  function _getListenersMatchingListenerOff(listenerOff) {
    const listenerIndexes = [];
    const eventName = listenerOff.config.off;
    if (_listeners[eventName]) {
      for (let i = 0; i < _listeners[eventName].length; i++) {
        const listenerOn = _listeners[eventName][i];
        if (_listenerOffMatchesListenerOn(listenerOff, listenerOn)) {
          listenerIndexes.push(i);
        }
      }
    }
    return listenerIndexes;
  }

  /**
   * Checks whether the listener on matches the listener off.
   *
   * @param {DataLayer.Item} listenerOff The listener off.
   * @param {DataLayer.Item} listenerOn The listener on.
   * @returns {Boolean} true if the listener on matches the listener off, false otherwise.
   * @private
   */
  function _listenerOffMatchesListenerOn(listenerOff, listenerOn) {
    const listenerOffConfig = listenerOff.config;
    const listenerOnConfig = listenerOn.config;

    for (let i = 0; i < Object.keys(listenerOffConfig).length; i++) {
      const key = Object.keys(listenerOffConfig)[i];
      if (key === 'off') {
        if (listenerOffConfig.off !== listenerOnConfig.on) {
          return false;
        }
        continue;
      }
      if (listenerOffConfig[key] !== listenerOnConfig[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks whether the listener is registered.
   *
   * @param {DataLayer.Item} listenerOn The listener on.
   * @returns {Boolean} true if the listener is registered, false otherwise.
   * @private
   */
  function _isRegisteredListener(listenerOn) {
    const eventName = listenerOn.config.on;
    if (_listeners[eventName]) {
      for (let i = 0; i < _listeners[eventName].length; i++) {
        const existingListenerOn = _listeners[eventName][i];
        if (isEqual(listenerOn.config, existingListenerOn.config)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks if the given listenerConfig has a selector that points to an object in the data payload of the itemConfig.
   *
   * @param {ListenerOnConfig} listenerConfig Config of the listener to extract the selector from.
   * @param {DataLayer.Item} item The item.
   * @returns {Boolean} true if a selector is not provided or if the given selector is matching, false otherwise.
   * @private
   */
  function _isSelectorMatching(listenerConfig, item) {
    const itemConfig = item.config;
    if (listenerConfig.selector && itemConfig.data) {
      return has(itemConfig.data, listenerConfig.selector);
    } else {
      return true;
    }
  }

  return that;
};

module.exports = ListenerManager;
