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
/* global console, window, CustomEvent */
(function() {
    'use strict';

    /* eslint no-console: "off" */
    /* eslint no-unused-vars: "off" */

    /**
     * @typedef {String} DataLayerEvents
     **/

    /**
     * Enumeration of data layer events.
     *
     * @enum {DataLayerEvents}
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
     * @typedef {String} ListenerScope
     **/

    /**
     * Enumeration of listener scopes.
     *
     * @enum {ListenerScope}
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
     * Data Layer
     *
     * @class DataLayer
     * @classdesc Data Layer controller that augments the passed data layer array and handles eventing.
     * @param {Object} config The Data Layer controller configuration.
     */
    function DataLayer(config) {
        var that = this;

        that._config = config;
        that._initialize();
    }

    /**
     * Initializes the data layer.
     *
     * @private
     */
    DataLayer.prototype._initialize = function() {
        var that = this;

        if (!Array.isArray(that._config.dataLayer)) {
          that._config.dataLayer = [];
        }

        that._dataLayer = that._config.dataLayer;
        that._state = {};
        that._listeners = [];

        /**
         * Returns a deep copy of the data layer state.
         *
         * @returns {Object} The deep copied state object.
         */
        that._dataLayer.getState = function() {
            // use deep copying technique of JSON stringify and parsing the state.
            return JSON.parse(JSON.stringify(that._state));
        };

        that._handleItemsBeforeScriptLoad(that._dataLayer);
        that._overridePush();

        that._triggerListeners({
            'event': events.READY
        }, events.READY);
    };

    /**
     * Handles the items that were pushed before the data layer script loaded.
     *
     * @private
     */
    DataLayer.prototype._handleItemsBeforeScriptLoad = function() {
        var that = this;

        that._dataLayer.forEach(function(item, idx) {
            // remove event listeners defined before the script load
            if (that._isListener(item)) {
                that._dataLayer.splice(idx, 1);
            }
            that._handleItem(item);
        });
    };

    /**
     * Overrides the push function of DataLayer.dataLayer to handle item pushes.
     *
     * @private
     */
    DataLayer.prototype._overridePush = function() {
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
                var item = pushArguments[key];
                that._handleItem(item);

                // filter out event listeners
                if (that._isListener(item)) {
                    delete filteredArguments[key];
                }
            });

            if (filteredArguments[0]) {
                return Array.prototype.push.apply(this, filteredArguments);
            }
        };
    };

    /**
     * Handles an item pushed to the data layer.
     *
     * @param {ItemConfig} item The item configuration.
     * @private
     */
    DataLayer.prototype._handleItem = function(item) {
        if (!item) {
            return;
        }
        if (this._isListener(item)) {
            if (item.on) {
                this._registerListener(item);
                // this._triggerListener(item);
            } else if (item.off) {
                this._unregisterListener(item);
            }
        } else {
            if (item.data) {
                this._updateState(item);
                this._triggerListeners(item, events.CHANGE);
            }
            if (item.event) {
                this._triggerListeners(item, events.EVENT);
            }
        }
    };

    /**
     * Updates the state with the passed data configuration.
     *
     * @param {DataConfig} item The data configuration.
     * @private
     */
    DataLayer.prototype._updateState = function(item) {
        DataLayer.utils.deepMerge(this.state, item.data);
    };

    DataLayer.prototype._triggerListeners = function(item, event) {
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

    DataLayer.prototype._triggerListener = function(listener) {
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
    DataLayer.prototype._registerListener = function(item) {
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
    DataLayer.prototype._unregisterListener = function(item) {
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
    DataLayer.prototype._getListenerIndexes = function(item) {
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
     * Determines whether the passed item is a listener configuration.
     *
     * @param {ItemConfig} item The listener on/off configuration.
     * @returns {Boolean} true if the item is a listener on/off configuration, false otherwise.
     * @private
     */
    DataLayer.prototype._isListener = function(item) {
        return !!((item.on && item.handler) || item.off);
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

    new DataLayer({
      dataLayer: dataLayer
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

})();
