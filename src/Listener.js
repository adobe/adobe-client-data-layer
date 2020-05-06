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

const CONSTANTS = require('./constants');

/**
 * Constructs a data layer listener.
 *
 * @param {Item} item The item from which to construct the listener.
 */

module.exports = function(item) {
  const _event = item.config.on || item.config.off;
  const _handler = item.config.handler || null;
  const _scope = item.config.scope || (item.config.on && CONSTANTS.listenerScope.ALL) || null;
  const _path = item.config.path || null;

  return {
    /**
     * Returns the listener event name.
     *
     * @returns {String} The listener event name.
     */
    event: _event,

    /**
     * Returns the listener handler.
     *
     * @returns {(Function|null)} The listener handler.
     */
    handler: _handler,

    /**
     * Returns the listener scope.
     *
     * @returns {(String|null)} The listener scope.
     */
    scope: _scope,

    /**
     * Returns the listener path.
     *
     * @returns {(String|null)} The listener path.
     */
    path: _path
  };
};
