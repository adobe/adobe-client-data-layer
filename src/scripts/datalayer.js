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
(function() {
    'use strict';

    /* eslint no-console: "off" */
    /* eslint no-unused-vars: "off" */

    /**
     * Data Layer.
     *
     * @type {Object}
     */
    var DataLayer = {};

    /**
     * @typedef {String} DataLayer.Events
     **/

    /**
     * Enumeration of data layer events.
     *
     * @enum {DataLayer.Events}
     * @readonly
     */
    var events = {
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
    var listenerScope = {
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
     * @property {String} name Name of the event.
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
        var that = this;

        that._config = config;
        that._initialize();
    };

    /**
     * Initializes the data layer.
     *
     * @private
     */
    DataLayer.Manager.prototype._initialize = function() {
        var that = this;

        if (!Array.isArray(that._config.dataLayer)) {
            that._config.dataLayer = [];
        }

        that._dataLayer = that._config.dataLayer;
        that._state = {};
        that._listeners = [];

        that._augment();
        that._processItems();

        that._triggerListeners({
            'event': events.READY
        }, events.READY);
    };

    /**
     * Augments the data layer Array Object, overriding push() and adding getState().
     *
     * @private
     */
    DataLayer.Manager.prototype._augment = function() {
        var that = this;

        /**
         * Pushes one or more items to the data layer.
         *
         * @param {...ItemConfig} var_args The items to add to the data layer.
         * @returns {Number} The length of the data layer following push.
         */
        that._dataLayer.push = function(var_args) { /* eslint-disable-line camelcase */
            var pushArguments = arguments;
            var filteredArguments = arguments;

            Object.keys(pushArguments).forEach(function(key) {
                var itemConfig = pushArguments[key];
                var item = new DataLayer.Item(itemConfig);

                that._processItem(item);

                // filter out event listeners
                if (item.utils.isListenerConfig(item.getConfig())) {
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
        var that = this;

        for (var i = 0; i < that._dataLayer.length; i++) {
            var item = new DataLayer.Item(that._dataLayer[i]);

            that._processItem(item);

            // remove event listeners from the data layer array
            if (item.utils.isListenerConfig(item.getConfig())) {
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
        var that = this;

        if (!item.isValid()) {
            var message = 'The following item cannot be handled by the data layer ' +
                'because it does not have a valid format: ' +
                JSON.stringify(item);
            console.error(message);
            return;
        }

        var typeProcessors = {
            data: function(item) {
                that._updateState(item);
                that._triggerListeners(item.getConfig(), events.CHANGE);
            },
            event: function(item) {
                that._triggerListeners(item);
                if (item.getConfig().data) {
                    that._updateState(item);
                    that._triggerListeners(item.getConfig(), events.CHANGE);
                }
            },
            listenerOn: function(item) {
                that._registerListener(item.getConfig());
            },
            listenerOff: function(item) {
                that._unregisterListener(item.getConfig());
            }
        };

        typeProcessors[item.getType()](item);
    };

    /**
     * Updates the state with the passed data configuration.
     *
     * @param {DataConfig} item The data configuration.
     * @private
     */
    DataLayer.Manager.prototype._updateState = function(item) {
        DataLayer.utils.deepMerge(this._state, item.data);
    };

    DataLayer.Manager.prototype._triggerListeners = function(item, event) {
        var that = this;

        console.debug('event triggered -', event);

        that._listeners.forEach(function(listener) {
            if (listener.on === event || listener.on === item.event) {
                var copy = JSON.parse(JSON.stringify(item));

                if (item.event) {
                    copy.name = item.event;
                }

                listener.handler(copy);
            }
        });
    };

    DataLayer.Manager.prototype._triggerListener = function(listener) {
        this.dataLayer.forEach(function(item) {
            if (listener.on === events.READY || listener.on === events.CHANGE || listener.on === events.EVENT || listener.on === item.event) {
                listener.handler(item);
            }
        });
    };

    /**
     * Registers a listener based on a listener on configuration.
     *
     * @param {ListenerOnConfig} item The listener on configuration.
     * @private
     */
    DataLayer.Manager.prototype._registerListener = function(item) {
        if (this._getListenerIndexes(item).length === 0) {
            this._listeners.push(item);

            console.debug('listener registered on -', item.on);
        }
    };

    /**
     * Unregisters a listener based on a listener off configuration.
     *
     * @param {ListenerOffConfig} item The listener off configuration.
     * @private
     */
    DataLayer.Manager.prototype._unregisterListener = function(item) {
        var tmp = JSON.parse(JSON.stringify(item));
        tmp.on = item.off;
        delete tmp.off;
        var indexes = this._getListenerIndexes(tmp);
        for (var i = 0; i < indexes.length; i++) {
            if (indexes[i] > -1) {
                this._listeners.splice(indexes[i], 1);

                console.debug('listener unregistered on -', tmp.on);
            }
        }
    };

    /**
     * Gets the indexes listener matches based on a listener on configuration.
     *
     * @param {ListenerOnConfig} item The listener on configuration.
     * @returns {Array} The indexes of the listener matches.
     * @private
     */
    DataLayer.Manager.prototype._getListenerIndexes = function(item) {
        var listenerIndexes = [];
        for (var i = 0; i <  this._listeners.length; i++) {
            var existingListener = this._listeners[i];
            if (item.on === existingListener.on) {
                if (item.handler && (item.handler.toString() !== existingListener.handler.toString())) {
                    continue;
                }
                listenerIndexes.push(i);
                continue;
            }
        }
        return listenerIndexes;
    };

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
     */
    DataLayer.Item = function DataLayer(itemConfig) {
        var that = this;
        that._config = itemConfig;
        that._type = function(config) {
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
        }(itemConfig);

        that._valid = !!that._type;
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
            return (Object.keys(itemConfig).length === 1 && itemConfig.event) ||
                (Object.keys(itemConfig).length === 2 && itemConfig.event && itemConfig.info) ||
                (Object.keys(itemConfig).length === 2 && itemConfig.event && itemConfig.data) ||
                (Object.keys(itemConfig).length === 3 && itemConfig.event && itemConfig.info && itemConfig.data);
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
            return (Object.keys(itemConfig).length === 2 && itemConfig.on && itemConfig.handler) ||
                (Object.keys(itemConfig).length === 3 && itemConfig.on && itemConfig.handler && itemConfig.scope) ||
                (Object.keys(itemConfig).length === 3 && itemConfig.on && itemConfig.handler && itemConfig.selector) ||
                (Object.keys(itemConfig).length === 4 && itemConfig.on && itemConfig.handler && itemConfig.scope && itemConfig.selector);
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
            return (Object.keys(itemConfig).length === 1 && itemConfig.off) ||
                (Object.keys(itemConfig).length === 2 && itemConfig.off && itemConfig.handler) ||
                (Object.keys(itemConfig).length === 3 && itemConfig.off && itemConfig.handler && itemConfig.scope) ||
                (Object.keys(itemConfig).length === 3 && itemConfig.off && itemConfig.handler && itemConfig.selector) ||
                (Object.keys(itemConfig).length === 4 && itemConfig.off && itemConfig.handler && itemConfig.scope && itemConfig.selector);
        }
    };

    /**
     * Data Layer utilities.
     *
     * @type {Object}
     */
    DataLayer.utils = {};

    /**
     * Deep merges a source and target object.
     *
     * @param {Object} target The target object.
     * @param {Object} source The source object.
     * @static
     */
    DataLayer.utils.deepMerge = function(target, source) {
        var tmpSource = {};
        var that = this;
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
    };

    /**
     * Checks whether the passed object is an object.
     *
     * @param {Object} obj The object that will be checked.
     * @returns {Boolean} true if it is an object, false otherwise.
     * @static
     */
    DataLayer.utils.isObject = function(obj) {
        return (obj && typeof obj === 'object' && !Array.isArray(obj));
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
})();
