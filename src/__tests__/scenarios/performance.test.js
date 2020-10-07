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

  // high load benchmark: runs alone in 16.078s (28/mon/2020)
  test('high load', () => {
    const mockCallback = jest.fn();
    const data = {};
    const start = new Date();

    adobeDataLayer.addEventListener('carousel clicked', mockCallback);

    for (let i = 0; i < 1000; i++) {
      const pageId = '/content/mysite/en/products/crossfit' + i;
      const pageKey = 'page' + i;
      const page = {
        id: pageId,
        siteLanguage: 'en-us',
        siteCountry: 'US',
        pageType: 'product detail',
        pageName: 'pdp - crossfit zoom',
        pageCategory: 'women > shoes > athletic'
      };
      const pushArg = {
        event: 'carousel clicked'
      };
      data[pageKey] = page;
      pushArg[pageKey] = page;
      adobeDataLayer.push(pushArg);
      expect(adobeDataLayer.getState()).toStrictEqual(data);
      expect(mockCallback.mock.calls.length).toBe(i + 1);
    }

    expect(new Date() - start, 'to be smaller ms time than').toBeLessThan(60000);
  });
});
