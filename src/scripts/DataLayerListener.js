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
/**
 * A data layer listener.
 *
 * @class Listener
 * @classdesc A data layer listener.
 */
class Listener {
  /**
   * Constructs a data layer listener.
   *
   * @param {Item} item The item from which to construct the listener.
   * @constructor
   */
  constructor(item) {
    const that = this;
    that._event = item.config.on ? item.config.on : item.config.off;
    that._handler = item.config.handler;
    that._scope = item.config.scope;
    that._selector = item.config.selector;
  }

  /**
   * Returns the listener event name.
   *
   * @returns {String} The listener event name.
   */
  get event() {
    return this._event;
  };

  /**
   * Returns the listener handler.
   *
   * @returns {Function} The listener handler.
   */
  get handler() {
    return this._handler;
  };

  /**
   * Returns the listener scope.
   *
   * @returns {String} The listener scope.
   */
  get scope() {
    return this._scope;
  };

  /**
   * Returns the listener selector.
   *
   * @returns {String} The listener selector.
   */
  get selector() {
    return this._selector;
  };
}

module.exports = Listener;
