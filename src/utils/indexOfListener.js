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

const _ = require('../../custom-lodash');
const isEqual = _.isEqual;

module.exports = function(listeners, listener) {
  const event = listener.event;

  if (Object.prototype.hasOwnProperty.call(listeners, event)) {
    for (const [index, registeredListener] of listeners[event].entries()) {
      if (isEqual(registeredListener.handler, listener.handler)) {
        return index;
      }
    }
  }
  return -1;
};
