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

/**
 * Data Layer.
 *
 * @type {Object}
 */
const DataLayer = {};
DataLayer.Item = require('./DataLayerItem');
DataLayer.utils = require('./DataLayerUtils');

/**
 * @typedef {String} DataLayer.Events
 **/

/**
 * Enumeration of data layer events.
 *
 * @enum {DataLayer.Events}
 * @readonly
 */
const events = {
  /** Represents an event triggered for any change in the data layer state */
  CHANGE: 'datalayer:change',
  /** Represents an event triggered for any event push to the data layer */
  EVENT: 'datalayer:event',
  /** Represents an event triggered when the data layer has initialized */
  READY: 'datalayer:ready'
};

/**
 * @typedef {String} DataLayer.ListenerScope
 **/

/**
 * Enumeration of listener scopes.
 *
 * @enum {DataLayer.ListenerScope}
 * @readonly
 */
const listenerScope = {
  /** Past events only */
  PAST: 'past',
  /** Future events only */
  FUTURE: 'future',
  /** All events, past and future */
  ALL: 'all'
};

/**
 * @typedef  {Object} ListenerOnConfig
 * @property {String} on Name of the event to bind to.
 * @property {String} [selector] Object key in the state to bind to.
 * @property {ListenerScope} [scope] Scope of the listener.
 * @property {Function} handler Handler to execute when the bound event is triggered.
 */

/**
 * @typedef  {Object} ListenerOffConfig
 * @property {String} off Name of the event to unbind.
 * @property {String} [selector] Object key in the state to bind to.
 * @property {ListenerScope} [scope] Scope of the listener.
 * @property {Function} [handler] Handler for a previously attached event to unbind.
 */

/**
 * @typedef {Object} DataConfig
 * @property {Object} data Data to be updated in the state.
 */

/**
 * @typedef {Object} EventConfig
 * @property {String} event Name of the event.
 * @property {Object} [info] Additional information to pass to the event handler.
 * @property {DataConfig.data} [data] Data to be updated in the state.
 */

/**
 * @typedef {DataConfig | EventConfig | ListenerOnConfig | ListenerOffConfig} ItemConfig
 */

/**
 * Manager
 *
 * @class Manager
 * @classdesc Data Layer manager that augments the passed data layer array and handles eventing.
 * @param {Object} config The Data Layer manager configuration.
 */
DataLayer.Manager = function DataLayer(config) {
  const that = this;

  that._config = config;
  that._initialize();
};

/**
 * Initializes the data layer.
 *
 * @private
 */
DataLayer.Manager.prototype._initialize = function() {
  const that = this;

  if (!Array.isArray(that._config.dataLayer)) {
    that._config.dataLayer = [];
  }

  that._dataLayer = that._config.dataLayer;
  that._state = {};
  that._listeners = {};

  that._augment();
  that._processItems();

  const readyItem = new DataLayer.Item({
    event: events.READY
  });
  that._triggerListeners(readyItem);
};

/**
 * Updates the state with the item.
 *
 * @param {DataLayer.Item} item The item .
 * @private
 */
DataLayer.Manager.prototype._updateState = function(item) {
  DataLayer.utils.deepMerge(this._state, item.config.data);
};

/**
 * Augments the data layer Array Object, overriding push() and adding getState().
 *
 * @private
 */
DataLayer.Manager.prototype._augment = function() {
  const that = this;

  /**
   * Pushes one or more items to the data layer.
   *
   * @param {...ItemConfig} var_args The items to add to the data layer.
   * @returns {Number} The length of the data layer following push.
   */
  that._dataLayer.push = function(var_args) { /* eslint-disable-line camelcase */
    const pushArguments = arguments;
    const filteredArguments = arguments;

    Object.keys(pushArguments).forEach(function(key) {
      const itemConfig = pushArguments[key];
      const item = new DataLayer.Item(itemConfig);

      that._processItem(item);

      // filter out event listeners and invalid items
      if (DataLayer.utils.isListenerConfig(itemConfig) || !item.valid) {
        delete filteredArguments[key];
      }
    });

    if (filteredArguments[0]) {
      return Array.prototype.push.apply(this, filteredArguments);
    }
  };

  /**
   * Returns a deep copy of the data layer state.
   *
   * @returns {Object} The deep copied state object.
   */
  that._dataLayer.getState = function() {
    // use deep copying technique of JSON stringify and parsing the state.
    return JSON.parse(JSON.stringify(that._state));
  };
};

/**
 * Processes all items that already exist on the stack.
 *
 * @private
 */
DataLayer.Manager.prototype._processItems = function() {
  const that = this;

  for (let i = 0; i < that._dataLayer.length; i++) {
    const item = new DataLayer.Item(that._dataLayer[i], i);

    that._processItem(item);

    // remove event listener or invalid item from the data layer array
    if (DataLayer.utils.isListenerConfig(item.config) || !item.valid) {
      that._dataLayer.splice(i, 1);
      i--;
    }
  }
};

/**
 * Processes an item pushed to the stack.
 *
 * @param {DataLayer.Item} item The item to process.
 * @private
 */
DataLayer.Manager.prototype._processItem = function(item) {
  const that = this;

  if (!item.valid) {
    const message = 'The following item cannot be handled by the data layer ' +
      'because it does not have a valid format: ' +
      JSON.stringify(item.config);
    console.error(message);
    return;
  }

  const typeProcessors = {
    data: function(item) {
      that._updateState(item);
      that._triggerListeners(item);
    },
    event: function(item) {
      if (item.config.data) {
        that._updateState(item);
      }
      that._triggerListeners(item);
    },
    listenerOn: function(item) {
      that._processListenerOn(item);
    },
    listenerOff: function(item) {
      that._unregisterListener(item);
    }
  };

  typeProcessors[item.type](item);
};

/**
 * Processes the item of type: listener on.
 *
 * @param {DataLayer.Item} listener The listener.
 * @private
 */
DataLayer.Manager.prototype._processListenerOn = function(listener) {
  let scope = listener.config.scope;
  if (!scope) {
    scope = listenerScope.FUTURE;
  }
  switch (scope) {
    case listenerScope.PAST:
      // trigger the handler for all the previous items
      this._triggerListener(listener);
      break;
    case listenerScope.FUTURE:
      // register the listener
      this._registerListener(listener);
      break;
    case listenerScope.ALL:
      // trigger the handler for all the previous items
      this._triggerListener(listener);
      // register the listener
      this._registerListener(listener);
  }
};

/**
 * Triggers the listener on all the items that were registered before.
 *
 * @param {DataLayer.Item} listener The listener.
 * @private
 */
DataLayer.Manager.prototype._triggerListener = function(listener) {
  const that = this;
  const listenerIdx = listener.index;

  if (listenerIdx === 0 || this._dataLayer.length === 0 || listenerIdx > this._dataLayer.length - 1) {
    return;
  }

  const processLength = (!listenerIdx) ? this._dataLayer.length : listenerIdx;
  for (let i = 0; i < processLength; i++) {
    const itemConfig = this._dataLayer[i];
    const item = new DataLayer.Item(itemConfig, i);
    that._callListenerHandler(listener, item);
  }
};

/**
 * Triggers all the registered listeners matching the item.
 *
 * @param {DataLayer.Item} item The item.
 * @private
 */
DataLayer.Manager.prototype._triggerListeners = function(item) {
  const that = this;
  const triggeredEvents = that._getTriggeredEvents(item);
  triggeredEvents.forEach(function(eventName) {
    if (that._listeners[eventName]) {
      that._listeners[eventName].forEach(function(listener) {
        that._callListenerHandler(listener, item);
      });
    }
  });
};

/**
 * Calls the listener on the item if a match is found.
 *
 * @param {DataLayer.Item} listener The listener.
 * @param {DataLayer.Item} item The item.
 * @private
 */
DataLayer.Manager.prototype._callListenerHandler = function(listener, item) {
  if (this._isMatching(listener, item)) {
    const listenerConfig = listener.config;
    const itemConfig = item.config;
    const itemConfigCopy = JSON.parse(JSON.stringify(itemConfig));
    listenerConfig.handler(itemConfigCopy);
  }
};

/**
 * Checks if the listener matches the item.
 *
 * @param {DataLayer.Item} listener The listener.
 * @param {DataLayer.Item} item The item.
 * @returns {Boolean} true if listener matches the item, false otherwise.
 * @private
 */
DataLayer.Manager.prototype._isMatching = function(listener, item) {
  const listenerConfig = listener.config;
  const itemConfig = item.config;
  let isMatching = false;

  if (DataLayer.utils.isDataConfig(itemConfig)) {
    if (listenerConfig.on === events.CHANGE) {
      isMatching = true;
    }
  } else if (DataLayer.utils.isEventConfig(itemConfig)) {
    if (listenerConfig.on === events.EVENT ||
      listenerConfig.on === itemConfig.event) {
      isMatching = true;
    }
    if (itemConfig.data &&
      listenerConfig.on === events.CHANGE) {
      isMatching = true;
    }
  }
  return isMatching;
};

/**
 * Returns the names of the events that are triggered for this item.
 *
 * @param {DataLayer.Item} item The item.
 * @returns {Array} An array with the names of the events that are triggered for this item.
 * @private
 */
DataLayer.Manager.prototype._getTriggeredEvents = function(item) {
  const triggeredEvents = [];
  const itemConfig = item.config;
  if (DataLayer.utils.isDataConfig(itemConfig)) {
    triggeredEvents.push(events.CHANGE);
  } else if (DataLayer.utils.isEventConfig(itemConfig)) {
    triggeredEvents.push(itemConfig.event);
    triggeredEvents.push(events.EVENT);
    if (itemConfig.data) {
      triggeredEvents.push(events.CHANGE);
    }
  }
  return triggeredEvents;
};

/**
 * Registers a listener based on a listener on configuration.
 *
 * @param {DataLayer.Item} listenerOn The listener on.
 * @private
 */
DataLayer.Manager.prototype._registerListener = function(listenerOn) {
  const eventName = listenerOn.config.on;
  if (!this._isRegisteredListener(listenerOn)) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(listenerOn);

    console.debug('listener registered on: ', eventName);
  }
};

/**
 * Unregisters a listener.
 *
 * @param {DataLayer.Item} listenerOff The listener off.
 * @private
 */
DataLayer.Manager.prototype._unregisterListener = function(listenerOff) {
  const indexes = this._getListenersMatchingListenerOff(listenerOff);
  const eventName = listenerOff.config.off;
  for (let i = 0; i < indexes.length; i++) {
    if (indexes[i] > -1) {
      this._listeners[eventName].splice(indexes[i], 1);

      console.debug('listener unregistered on: ', eventName);
    }
  }
};

/**
 * Returns the indexes of the registered listeners that match the listener off.
 *
 * @param {DataLayer.Item} listenerOff The listener off.
 * @returns {Array} The indexes of the matching listeners.
 * @private
 */
DataLayer.Manager.prototype._getListenersMatchingListenerOff = function(listenerOff) {
  const that = this;
  const listenerIndexes = [];
  const eventName = listenerOff.config.off;
  if (that._listeners[eventName]) {
    for (let i = 0; i < that._listeners[eventName].length; i++) {
      const listenerOn = that._listeners[eventName][i];
      if (that._listenerOffMatchesListenerOn(listenerOff, listenerOn)) {
        listenerIndexes.push(i);
      }
    }
  }
  return listenerIndexes;
};

/**
 * Checks whether the listener on matches the listener off.
 *
 * @param {DataLayer.Item} listenerOff The listener off.
 * @param {DataLayer.Item} listenerOn The listener on.
 * @returns {Boolean} true if the listener on matches the listener off, false otherwise.
 * @private
 */
DataLayer.Manager.prototype._listenerOffMatchesListenerOn = function(listenerOff, listenerOn) {
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
};

/**
 * Checks whether the listener is registered.
 *
 * @param {DataLayer.Item} listenerOn The listener on.
 * @returns {Boolean} true if the listener is registered, false otherwise.
 * @private
 */
DataLayer.Manager.prototype._isRegisteredListener = function(listenerOn) {
  const that = this;
  const eventName = listenerOn.config.on;
  if (that._listeners[eventName]) {
    for (let i = 0; i < that._listeners[eventName].length; i++) {
      const existingListenerOn = that._listeners[eventName][i];
      if (that.listenersAreEqual(listenerOn, existingListenerOn)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Checks whether the listeners are equal.
 *
 * @param {DataLayer.Item} listener1 The listener.
 * @param {DataLayer.Item} listener2 The listener.
 * @returns {Boolean} true if the listeners are equal, false otherwise.
 * @private
 */
DataLayer.Manager.prototype.listenersAreEqual = function(listener1, listener2) {
  const listenerConfig1 = listener1.config;
  const listenerConfig2 = listener2.config;
  if (Object.keys(listenerConfig1).length !== Object.keys(listenerConfig2).length) {
    return false;
  }
  Object.keys(listenerConfig1).forEach(function(key) {
    if (listenerConfig1[key] !== listenerConfig2[key]) {
      return false;
    }
  });
  return true;
};

new DataLayer.Manager({
  dataLayer: window.dataLayer
});

/**
 * Triggered when there is change in the data layer state.
 *
 * @event DataLayerEvents.CHANGE
 * @type {Object}
 * @property {Object} data Data pushed that caused a change in the data layer state.
 */

/**
 * Triggered when an event is pushed to the data layer.
 *
 * @event DataLayerEvents.EVENT
 * @type {Object}
 * @property {String} name Name of the committed event.
 * @property {Object} info Additional information passed with the committed event.
 * @property {Object} data Data that was pushed alongside the event.
 */

/**
 * Triggered when an arbitrary event is pushed to the data layer.
 *
 * @event <custom>
 * @type {Object}
 * @property {String} name Name of the committed event.
 * @property {Object} info Additional information passed with the committed event.
 * @property {Object} data Data that was pushed alongside the event.
 */

/**
 * Triggered when the data layer has initialized.
 *
 * @event DataLayerEvents.READY
 * @type {Object}
 */

module.exports = DataLayer;
