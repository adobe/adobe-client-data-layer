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

describe.skip('Functions', () => {
  clearDL();

  test('push simple function', () => {
    const mockCallback = jest.fn();
    adobeDataLayer.push(mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('function adds event listener for adobeDataLayer:change', () => {
    const mockCallback = jest.fn();
    const addEventListener = function(adl) {
      adl.addEventListener('adobeDataLayer:change', mockCallback);
    };

    adobeDataLayer.push(testData.carousel1);
    adobeDataLayer.push(addEventListener);
    adobeDataLayer.push(testData.carousel2);

    expect(mockCallback.mock.calls.length, 'event triggered twice').toBe(2);
  });

  test('function updates component in data layer state', () => {
    const updateCarousel = function(adl) {
      adl.push(testData.carousel1new);
    };

    adobeDataLayer.push(testData.carousel1);
    expect(adobeDataLayer.getState(), 'carousel set to carousel1').toEqual(testData.carousel1);

    adobeDataLayer.push(updateCarousel);
    expect(adobeDataLayer.getState(), 'carousel set to carousel1new').toEqual(testData.carousel1new);
  });
});
