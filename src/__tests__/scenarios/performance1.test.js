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

const DataLayerManager = require('../../dataLayerManager');
const DataLayer = { Manager: DataLayerManager };
let adobeDataLayer;

const clearDL = function() {
  beforeEach(() => {
    adobeDataLayer = [];
    DataLayer.Manager({ dataLayer: adobeDataLayer });
  });
};

describe('Performance', () => {
  clearDL();

  // high load benchmark: runs alone in 4.986s (16/oct/2020)
  test('high load', () => {
    const mockCallback = jest.fn();
    const handler = function(event, before, after) {
      mockCallback(event, before, after);
    };
    const start = new Date();
    let listenerIdx = 0;

    for (let i = 0; i < 1000; i++) {
      // push an object at each iteration
      const cmp = {};
      const cmpId = 'cmp-' + i;
      const cmpProps = {
        id: cmpId,
        siteLanguage: 'en-us',
        siteCountry: 'US',
        pageType: 'product detail',
        pageName: 'pdp - crossfit zoom',
        pageCategory: 'women > shoes > athletic'
      };
      cmp[cmpId] = cmpProps;
      adobeDataLayer.push(cmp);

      // push an event at each iteration, the event type goes from event-0 to event-9, then again event-0 to event-9, and so on
      const eventType = 'event-' + i % 10;
      const event = {
        event: eventType,
        counter: i
      };
      adobeDataLayer.push(event);

      // push an event listener every 10 iterations, listening on event-0 to event-9, then again event-0 to event-9, and so on
      if (i % 10 === 0) {
        const listenerEventType = 'event-' + listenerIdx % 10;
        adobeDataLayer.addEventListener(listenerEventType, handler);
        listenerIdx++;
      }
    }

    expect(mockCallback.mock.calls.length).toBe(1000);
    expect(new Date() - start, 'to be smaller ms time than').toBeLessThan(10000);
  });
});
