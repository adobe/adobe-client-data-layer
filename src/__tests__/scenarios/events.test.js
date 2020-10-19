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

const testData = require('../testData');
const DataLayerManager = require('../../dataLayerManager');
const DataLayer = { Manager: DataLayerManager };
let adobeDataLayer;

const clearDL = function() {
  beforeEach(() => {
    adobeDataLayer = [];
    DataLayer.Manager({ dataLayer: adobeDataLayer });
  });
};

describe('Events', () => {
  clearDL();

  test('push simple event', () => {
    adobeDataLayer.push(testData.carousel1click);
    expect(adobeDataLayer.getState()).toStrictEqual(testData.carousel1);
  });

  test.skip('check number of arguments in callback', () => {
    let calls = 0;

    adobeDataLayer.addEventListener('test', function() { calls = arguments.length; });

    adobeDataLayer.push({ event: 'test' });
    expect(calls, 'just one argument if no data is added').toStrictEqual(1);

    adobeDataLayer.push({ event: 'test', eventInfo: 'test' });
    expect(calls, 'just one argument if no data is added').toStrictEqual(1);

    adobeDataLayer.push({ event: 'test', somekey: 'somedata' });
    expect(calls, 'three arguments if data is added').toStrictEqual(3);
  });

  test('check if eventInfo is passed to callback', () => {
    adobeDataLayer.addEventListener('test', function() {
      expect(arguments[0].eventInfo).toStrictEqual('test');
    });

    adobeDataLayer.push({ event: 'test', eventInfo: 'test' });
  });
});
