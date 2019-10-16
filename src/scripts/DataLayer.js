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
  that._listeners = [];

  that._augment();
  that._processItems();

  const readyItem = new DataLayer.Item({
    event: events.READY
  }, -1);
  that._triggerListeners(readyItem);
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
      const item = new DataLayer.Item(itemConfig, -1);

      that._processItem(item);

      // filter out event listeners and invalid items
      if (item.utils.isListenerConfig(itemConfig) || !item.isValid()) {
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
    if (item.utils.isListenerConfig(item.getConfig()) || !item.isValid()) {
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

  if (!item.isValid()) {
    const message = 'The following item cannot be handled by the data layer ' +
      'because it does not have a valid format: ' +
      JSON.stringify(item.getConfig());
    console.error(message);
    return;
  }

  const typeProcessors = {
    data: function(item) {
      that._updateState(item);
      that._triggerListeners(item);
    },
    event: function(item) {
      if (item.getConfig().data) {
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

  typeProcessors[item.getType()](item);
};

/**
 * Processes the item of type: listener on.
 *
 * @param {DataLayer.Item} listener The listener.
 * @private
 */
DataLayer.Manager.prototype._processListenerOn = function(listener) {
  let scope = listener.getConfig().scope;
  if (!scope) {
    scope = listenerScope.FUTURE;
  }
  switch (scope) {
    case listenerScope.PAST:
      // trigger the handler for all the previous items
      this._triggerListenerOnPreviousItems(listener);
      break;
    case listenerScope.FUTURE:
      // register the listener
      this._registerListener(listener);
      break;
    case listenerScope.ALL:
      // trigger the handler for all the previous items
      this._triggerListenerOnPreviousItems(listener);
      // register the listener
      this._registerListener(listener);
      break;
    default:
      console.error('The listener does not have a valid scope: ' + scope);
  }
};

/**
 * Calls all the handlers matching the specified item.
 *
 * @param {DataLayer.Item} item The item.
 * @private
 */
DataLayer.Manager.prototype._triggerListeners = function(item) {
  const that = this;
  that._listeners.forEach(function(listenerConfig) {
    const listener = new DataLayer.Item(listenerConfig, -1);
    that._triggerListener(listener, item);
  });
};

/**
 * Calls the specified handler on all the previous items of the data layer.
 *
 * @param {DataLayer.Item} listener The listener.
 * @private
 */
DataLayer.Manager.prototype._triggerListenerOnPreviousItems = function(listener) {
  const that = this;
  const listenerIdx = listener.getIndex();

  if (listenerIdx === 0 || this._dataLayer.length === 0 || listenerIdx > this._dataLayer.length - 1) {
    return;
  }

  const processLength = (!listenerIdx || listenerIdx === -1) ? this._dataLayer.length : listenerIdx;
  for (let i = 0; i < processLength; i++) {
    const itemConfig = this._dataLayer[i];
    const item = new DataLayer.Item(itemConfig, i);
    that._triggerListener(listener, item);
  }
};

/**
 * If a match is found, calls the handler on the item.
 *
 * @param {DataLayer.Item} listener The listener.
 * @param {DataLayer.Item} item The item.
 * @private
 */
DataLayer.Manager.prototype._triggerListener = function(listener, item) {
  const listenerConfig = listener.getConfig();
  const itemConfig = item.getConfig();
  let isMatching = false;

  if (item.utils.isDataConfig(itemConfig)) {
    if (listenerConfig.on === events.CHANGE) {
      isMatching = true;
    }
  } else if (item.utils.isEventConfig(itemConfig)) {
    if (listenerConfig.on === events.EVENT ||
      listenerConfig.on === itemConfig.event) {
      isMatching = true;
    }
    if (itemConfig.data &&
      listenerConfig.on === events.CHANGE) {
      isMatching = true;
    }
  }

  if (isMatching) {
    const itemCopy = JSON.parse(JSON.stringify(item.getConfig()));
    listenerConfig.handler(itemCopy);
  }
};

/**
 * Registers a listener based on a listener on configuration.
 *
 * @param {DataLayer.Item} listenerOn The listener on.
 * @private
 */
DataLayer.Manager.prototype._registerListener = function(listenerOn) {
  const listenerOnConfig = listenerOn.getConfig();
  if (this._getRegisteredListeners(listenerOnConfig).length === 0) {
    this._listeners.push(listenerOnConfig);

    console.debug('listener registered on -', listenerOnConfig.on);
  }
};

/**
 * Unregisters a listener.
 *
 * @param {DataLayer.Item} listenerOff The listener off.
 * @private
 */
DataLayer.Manager.prototype._unregisterListener = function(listenerOff) {
  const listenerOffConfig = listenerOff.getConfig();
  const tmp = JSON.parse(JSON.stringify(listenerOffConfig));
  tmp.on = listenerOffConfig.off;
  tmp.handler = listenerOffConfig.handler;
  delete tmp.off;
  const indexes = this._getRegisteredListeners(tmp);
  for (let i = 0; i < indexes.length; i++) {
    if (indexes[i] > -1) {
      this._listeners.splice(indexes[i], 1);

      console.debug('listener unregistered on -', tmp.on);
    }
  }
};

/**
 * Updates the state with the item.
 *
 * @param {DataLayer.Item} item The item .
 * @private
 */
DataLayer.Manager.prototype._updateState = function(item) {
  DataLayer.utils.deepMerge(this._state, item.getConfig().data);
};

/**
 * Returns the indexes of the registered listeners that match the specified listener.
 *
 * @param {ListenerOnConfig} listenerOnConfig The listener on configuration.
 * @returns {Array} The indexes of the listener matches.
 * @private
 */
DataLayer.Manager.prototype._getRegisteredListeners = function(listenerOnConfig) {
  const listenerIndexes = [];
  for (let i = 0; i < this._listeners.length; i++) {
    const existingListener = this._listeners[i];
    if (listenerOnConfig.on === existingListener.on) {
      if (listenerOnConfig.handler && (listenerOnConfig.handler.toString() !== existingListener.handler.toString())) {
        continue;
      }
      listenerIndexes.push(i);
    }
  }
  return listenerIndexes;
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
