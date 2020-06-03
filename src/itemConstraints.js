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

/**
 * Constraints for each type of the item configuration.
 */

const itemConstraints = {
  event: {
    event: {
      type: 'string'
    },
    eventInfo: {
      optional: true
    }
  },
  listenerOn: {
    on: {
      type: 'string'
    },
    handler: {
      type: 'function'
    },
    scope: {
      type: 'string',
      values: ['past', 'future', 'all'],
      optional: true
    },
    path: {
      type: 'string',
      optional: true
    }
  },
  listenerOff: {
    off: {
      type: 'string'
    },
    handler: {
      type: 'function',
      optional: true
    },
    scope: {
      type: 'string',
      values: ['past', 'future', 'all'],
      optional: true
    },
    path: {
      type: 'string',
      optional: true
    }
  }
};

module.exports = itemConstraints;
