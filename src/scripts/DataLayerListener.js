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
    this._event = item.config.on ? item.config.on : item.config.off;
    this._handler = (item.config.handler) ? item.config.handler : null;
    this._scope = (item.config.scope) ? item.config.scope : null;
    this._selector = (item.config.selector) ? item.config.selector : null;
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
   * @returns {(String|null)} The listener handler.
   */
  get handler() {
    return this._handler;
  };

  /**
   * Returns the listener scope.
   *
   * @returns {(String|null)} The listener scope.
   */
  get scope() {
    return this._scope;
  };

  /**
   * Returns the listener selector.
   *
   * @returns {(String|null)} The listener selector.
   */
  get selector() {
    return this._selector;
  };
}

module.exports = Listener;
